/**
 * Chat API — Vercel Serverless Function (RAG-Enhanced)
 * Proxy para Google Gemini API com:
 *   - Rate limiting por IP
 *   - Error handling robusto
 *   - RAG: Retrieval-Augmented Generation via vectors.json
 *
 * @version 3.0.0 (Story 9.3 — RAG Integration)
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Rate Limiting (in-memory, persiste entre warm starts da mesma instância)
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/** @type {Map<string, { count: number, resetAt: number }>} */
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }
  return { allowed: true, retryAfterSec: 0 };
}

// ---------------------------------------------------------------------------
// Gemini Error Mapping
// ---------------------------------------------------------------------------
const GEMINI_ERROR_MAP = {
  RESOURCE_EXHAUSTED: {
    status: 429, errorCode: 'QUOTA_EXCEEDED',
    message: 'Limite de uso da IA atingido. Tente novamente mais tarde.',
  },
  INVALID_ARGUMENT: {
    status: 400, errorCode: 'INVALID_ARGUMENT',
    message: 'A mensagem enviada não pôde ser processada.',
  },
  PERMISSION_DENIED: {
    status: 500, errorCode: 'CONFIG_ERROR',
    message: 'Erro de configuração do servidor.',
  },
  INTERNAL: {
    status: 502, errorCode: 'SERVICE_UNAVAILABLE',
    message: 'Serviço de IA temporariamente indisponível.',
  },
};

const DEFAULT_GEMINI_ERROR = {
  status: 502, errorCode: 'SERVICE_UNAVAILABLE',
  message: 'Serviço de IA temporariamente indisponível.',
};

// ---------------------------------------------------------------------------
// RAG — Vector Store (carregado uma vez na cold start e cacheado)
// ---------------------------------------------------------------------------
const EMBEDDING_MODEL = 'gemini-embedding-001';
const TOP_K = 5;

let vectorStore = null;

function loadVectorStore() {
  if (vectorStore) return vectorStore;

  try {
    const vectorsPath = resolve(process.cwd(), 'assets/data/vectors.json');
    const raw = readFileSync(vectorsPath, 'utf-8');
    vectorStore = JSON.parse(raw);
    console.log(`[RAG] Vector store loaded: ${vectorStore.length} documents`);
  } catch (e) {
    console.warn('[RAG] vectors.json not found or invalid. RAG disabled.', e.message);
    vectorStore = [];
  }
  return vectorStore;
}

// ---------------------------------------------------------------------------
// RAG — Cosine Similarity (pure math, zero deps)
// ---------------------------------------------------------------------------
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// ---------------------------------------------------------------------------
// RAG — Generate Embedding for user query
// ---------------------------------------------------------------------------
async function getQueryEmbedding(text, apiKey) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
        }),
      }
    );

    if (!response.ok) {
      console.warn('[RAG] Embedding API failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.embedding?.values || null;
  } catch (e) {
    console.warn('[RAG] Embedding error:', e.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// RAG — Retrieve Top-K relevant documents
// ---------------------------------------------------------------------------
function retrieveTopK(queryVector, store, k = TOP_K) {
  if (!queryVector || !store || store.length === 0) return [];

  const scored = store
    .filter(doc => doc.vector && doc.vector.length > 0)
    .map(doc => ({
      ...doc,
      score: cosineSimilarity(queryVector, doc.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  // Filtrar resultados com relevância mínima (threshold)
  return scored.filter(doc => doc.score > 0.3);
}

// ---------------------------------------------------------------------------
// RAG — Build context block for System Prompt injection
// ---------------------------------------------------------------------------
function buildRAGContext(relevantDocs) {
  if (!relevantDocs || relevantDocs.length === 0) return '';

  const contextBlocks = relevantDocs.map((doc, i) => {
    // Remover o vetor do content summary para não poluir o prompt
    const content = doc.contentSummary || '';
    const typeLabel = doc.type === 'certificate' ? '🎓 Certificado' : '📂 Projeto';
    return `[FONTE ${i + 1} — ${typeLabel}]: ${doc.title}\n${content}`;
  });

  return `\n\n<contexto_verificado>
As seguintes informações foram recuperadas da base de conhecimento real e verificada do Julio.
Use APENAS estas fontes para fundamentar sua resposta. Cite a fonte quando usar informações específicas.

${contextBlocks.join('\n\n')}
</contexto_verificado>`;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_MESSAGE_LENGTH = 500;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return res.status(400).json({
      error: 'Content-Type must be application/json',
      errorCode: 'INVALID_CONTENT_TYPE',
    });
  }

  // --- Rate limiting ---
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress || 'unknown';

  const { allowed, retryAfterSec } = checkRateLimit(ip);
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSec));
    return res.status(429).json({
      error: 'Muitas mensagens enviadas. Aguarde um momento.',
      errorCode: 'RATE_LIMITED',
      retryAfter: retryAfterSec,
    });
  }

  // --- Body validation ---
  const { message } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      error: 'Message is required',
      errorCode: 'EMPTY_MESSAGE',
    });
  }

  const sanitizedMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `Mensagem muito longa. Máximo de ${MAX_MESSAGE_LENGTH} caracteres.`,
      errorCode: 'MESSAGE_TOO_LONG',
    });
  }

  // --- API Key check ---
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing');
    return res.status(500).json({
      error: 'Server configuration error',
      errorCode: 'CONFIG_ERROR',
    });
  }

  // --- RAG: Retrieve relevant context ---
  let ragContext = '';
  let sources = [];

  try {
    const store = loadVectorStore();

    if (store.length > 0) {
      const queryVector = await getQueryEmbedding(sanitizedMessage, apiKey);

      if (queryVector) {
        const relevantDocs = retrieveTopK(queryVector, store);
        ragContext = buildRAGContext(relevantDocs);
        sources = relevantDocs.map(doc => ({
          title: doc.title,
          type: doc.type,
          score: Math.round(doc.score * 100),
        }));

        if (sources.length > 0) {
          console.log(`[RAG] ${sources.length} docs retrieved:`, sources.map(s => `${s.title} (${s.score}%)`).join(', '));
        }
      }
    }
  } catch (ragError) {
    console.warn('[RAG] Error during retrieval, falling back to static prompt:', ragError.message);
  }

  // --- Build System Prompt with RAG Context ---
  const systemPrompt = `You are the virtual assistant for Julio Cesar Okuda.
Context about Julio:
- He is transitioning his career from IT Infrastructure to AI Automation & Data Engineering.
- Profile: Junior/Mid-level Developer passionate about LLMs.
- Focus: Building autonomous agents, n8n workflows, and Python scripting for AI integration.
- Current Status: Studying heavily, building portfolio projects like 'crm-system' and 'cpf-serverless', and looking for opportunities to apply LLM knowledge.
- Key Skills: n8n, OpenAI API, Azure Fundamentals, Python, SQL.
${ragContext}

RULES:
- Reply in Portuguese (pt-BR).
- Be helpful, humble, and enthusiastic about technology.
- When answering about specific skills, certifications, or projects, use ONLY the verified context above. Do NOT invent or hallucinate information.
- If the context doesn't contain enough information to answer, say so honestly.
- When you use information from the verified context, mention the source naturally (e.g., "De acordo com o certificado X..." or "No projeto Y...").

User question: ${sanitizedMessage}`;

  // --- Call Gemini API ---
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: systemPrompt }],
          }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const geminiErrorStatus = data.error?.status || '';
      const mapped = GEMINI_ERROR_MAP[geminiErrorStatus] || DEFAULT_GEMINI_ERROR;

      console.error('Gemini API Error:', {
        status: response.status,
        geminiStatus: geminiErrorStatus,
        message: data.error?.message,
      });

      return res.status(mapped.status).json({
        error: mapped.message,
        errorCode: mapped.errorCode,
      });
    }

    // --- Handle safety filter ---
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
      return res.status(200).json({
        reply: 'Desculpe, não posso responder a essa pergunta por questões de segurança do conteúdo. Tente reformular sua pergunta!',
        errorCode: 'SAFETY',
      });
    }

    // --- Success ---
    const reply =
      candidate?.content?.parts?.[0]?.text ||
      'Desculpe, não consegui processar sua resposta.';

    res.status(200).json({
      reply,
      sources: sources.length > 0 ? sources : undefined,
    });

  } catch (error) {
    console.error('Gemini API Network Error:', error.message);
    res.status(502).json({
      error: 'Erro de conexão com o serviço de IA.',
      errorCode: 'NETWORK_ERROR',
    });
  }
}

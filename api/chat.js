/**
 * Chat API — Vercel Serverless Function
 * Proxy para Google Gemini API com rate limiting e error handling robusto.
 * @version 2.0.0 (Story 1.3)
 */

// ---------------------------------------------------------------------------
// Rate Limiting (in-memory, persiste entre warm starts da mesma instância)
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 15; // max requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto

/** @type {Map<string, { count: number, resetAt: number }>} */
const rateLimitMap = new Map();

/**
 * Verifica e aplica rate limit por IP.
 * @param {string} ip
 * @returns {{ allowed: boolean, retryAfterSec: number }}
 */
function checkRateLimit(ip) {
  const now = Date.now();

  // Cleanup: remover entradas expiradas a cada chamada
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
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
    status: 429,
    errorCode: 'QUOTA_EXCEEDED',
    message: 'Limite de uso da IA atingido. Tente novamente mais tarde.',
  },
  INVALID_ARGUMENT: {
    status: 400,
    errorCode: 'INVALID_ARGUMENT',
    message: 'A mensagem enviada não pôde ser processada.',
  },
  PERMISSION_DENIED: {
    status: 500,
    errorCode: 'CONFIG_ERROR',
    message: 'Erro de configuração do servidor.',
  },
  INTERNAL: {
    status: 502,
    errorCode: 'SERVICE_UNAVAILABLE',
    message: 'Serviço de IA temporariamente indisponível.',
  },
};

const DEFAULT_GEMINI_ERROR = {
  status: 502,
  errorCode: 'SERVICE_UNAVAILABLE',
  message: 'Serviço de IA temporariamente indisponível.',
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_MESSAGE_LENGTH = 500;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  // --- Method check ---
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- Content-Type validation ---
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
    req.socket?.remoteAddress ||
    'unknown';

  const { allowed, retryAfterSec } = checkRateLimit(ip);

  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSec));
    return res.status(429).json({
      error: 'Muitas mensagens enviadas. Aguarde um momento.',
      errorCode: 'RATE_LIMITED',
      retryAfter: retryAfterSec,
    });
  }

  // --- Body validation & sanitization ---
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

  // --- Call Gemini API ---
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are the virtual assistant for Julio Cesar Okuda.
                Context about Julio:
                - He is transitioning his career from IT Infrastructure to AI Automation & Data Engineering.
                - Profile: Junior/Mid-level Developer passionate about LLMs.
                - Focus: Building autonomous agents, n8n workflows, and Python scripting for AI integration.
                - Current Status: Studying heavily, building portfolio projects like 'crm-system' and 'cpf-serverless', and looking for opportunities to apply LLM knowledge.
                - Key Skills: n8n, OpenAI API, Azure Fundamentals, Python, SQL.
                
                Reply in Portuguese. Be helpful, humble, and enthusiastic about technology.
                
                User question: ${sanitizedMessage}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // --- Handle Gemini API errors ---
    if (!response.ok) {
      const geminiErrorStatus = data.error?.status || '';
      const mapped =
        GEMINI_ERROR_MAP[geminiErrorStatus] || DEFAULT_GEMINI_ERROR;

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
        reply:
          'Desculpe, não posso responder a essa pergunta por questões de segurança do conteúdo. Tente reformular sua pergunta!',
        errorCode: 'SAFETY',
      });
    }

    // --- Success ---
    const reply =
      candidate?.content?.parts?.[0]?.text ||
      'Desculpe, não consegui processar sua resposta.';

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Gemini API Network Error:', error.message);
    res.status(502).json({
      error: 'Erro de conexão com o serviço de IA.',
      errorCode: 'NETWORK_ERROR',
    });
  }
}


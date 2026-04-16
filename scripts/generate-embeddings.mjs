#!/usr/bin/env node
/**
 * generate-embeddings.mjs
 * Pipeline Autônomo: Textos Consolidados (Projetos + Certificados) → Gemini Embeddings → vectors.json
 *
 * Fluxo:
 *   1. Carrega assets/data/projects.json e assets/data/certificates.json (se existir)
 *   2. Filtra itens que já possuem vetores em vectors.json (ingestão incremental)
 *   3. Envia os novos/atualizados textos para a API gemini-text-embedding-004
 *   4. Salva o dicionário final em assets/data/vectors.json
 *
 * @version 1.0.0 (Story 9.2)
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS_JSON_PATH = resolve(__dirname, '../assets/data/projects.json');
const CERTS_JSON_PATH = resolve(__dirname, '../assets/data/certificates.json');
const VECTORS_JSON_PATH = resolve(__dirname, '../assets/data/vectors.json');

// ---------------------------------------------------------------------------
// Load .env fallback for local execution
// ---------------------------------------------------------------------------
const envPath = resolve(__dirname, '../.env');
if (existsSync(envPath)) {
    const envFile = readFileSync(envPath, 'utf8');
    for (const line of envFile.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            value = value.replace(/^(['"])(.*)\1$/, '$2').trim();
            if (process.env[key] === undefined) {
                process.env[key] = value;
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL = 'gemini-embedding-001'; // Modelo mais recente — Free Tier: 100 RPM / 1000 RPD

// Retry Wrapper (Exponential Backoff)
async function fetchWithRetry(url, options, retries = 3, delayMs = 15000) {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, options);
        if (response.ok) return response;

        let errBody;
        try { errBody = await response.json(); } catch { errBody = {}; }
        const code = errBody?.error?.code || response.status;

        if (code !== 429 && code !== 503) {
            throw new Error(errBody?.error?.message || `HTTP ${response.status}`);
        }

        if (i < retries - 1) {
            console.log(`   ⏳ API ocupada (Erro ${code}). Tentando novamente em ${delayMs / 1000}s...`);
            await new Promise(r => setTimeout(r, delayMs));
        } else {
            throw new Error(`Falha persistente após ${retries} tentativas: ${errBody?.error?.message}`);
        }
    }
}

// ---------------------------------------------------------------------------
// API Gemini: Gera o Vector Float Array para um texto base
// ---------------------------------------------------------------------------
async function generateEmbedding(text, title) {
    console.log(`   🧠 Extraindo vetor semântico: "${title}"...`);

    // Preparando o payload conforme a doc do text-embedding-004
    const payload = {
        model: `models/${EMBEDDING_MODEL}`,
        content: {
            parts: [{ text }]
        }
    };

    const response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    );

    if (!response.ok) {
        throw new Error(`Erro na geração de Embedding para ${title}`);
    }

    const data = await response.json();
    return data.embedding?.values;
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------
async function main() {
    console.log('🚀 Iniciando processamento de embeddings (Zero-Ops RAG)...\n');

    if (!GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY não configurada! Encerrando...');
        process.exit(1);
    }

    let existingVectors = [];
    try {
        if (existsSync(VECTORS_JSON_PATH)) {
            existingVectors = JSON.parse(readFileSync(VECTORS_JSON_PATH, 'utf-8'));
        }
    } catch (e) {
        console.error('⚠️ Falha ao ler vectors.json. Criando nova base.');
    }

    const vectorMap = new Map();
    existingVectors.forEach(v => vectorMap.set(v.id, v));

    const docsToEmbed = [];

    // 1. Ingerir Projetos
    if (existsSync(PROJECTS_JSON_PATH)) {
        const projects = JSON.parse(readFileSync(PROJECTS_JSON_PATH, 'utf-8'));
        projects.forEach(p => {
            const uniqueId = `project_${p.id}`;
            const textContent = `PROJETO: ${p.title}\nCATEGORIA: ${p.category}\nSKILLS: ${p.tags?.join(', ')}\nDESCRIÇÃO: ${p.description}\nRESUMO: ${p.resume}`;
            docsToEmbed.push({
                id: uniqueId,
                type: 'project',
                title: p.title,
                content: textContent,
                link: p.codeUrl || '#'
            });
        });
    }

    // 2. Ingerir Certificados
    if (existsSync(CERTS_JSON_PATH)) {
        const certs = JSON.parse(readFileSync(CERTS_JSON_PATH, 'utf-8'));
        certs.forEach(c => {
            const uniqueId = `cert_${c.id}`;
            const textContent = `CERTIFICADO: ${c.title}\nINSTITUIÇÃO: ${c.institution}\nCARGA HORÁRIA: ${c.hours || 'N/A'}h\nSKILLS: ${c.skills?.join(', ')}\nDESCRIÇÃO: ${c.description}`;
            docsToEmbed.push({
                id: uniqueId,
                type: 'certificate',
                title: c.title,
                content: textContent,
                link: '#'
            });
        });
    }

    console.log(`📋 Encontrados ${docsToEmbed.length} documentos no total.`);

    // 3. Processamento Incremental
    let newEmbeddingsCount = 0;

    for (const doc of docsToEmbed) {
        // Se já temos esse documento no map (comparando hash ou simplesmente se existir no fluxo rápido)
        // Como o portfólio e certificados costumam ser apensos em append-only, uma checagem de ID é suficiente (Fase 1).
        const existing = vectorMap.get(doc.id);

        // Se precisarmos de revalidação caso o project mude a description, 
        // seria comparar um SHA do `doc.content`. Por ora, checking just ID and matching content sizes / updates.
        // Vamos checar pelo hash do conteúdo para saber se mudou:
        const hashBuffer = Buffer.from(doc.content).toString('base64').substring(0, 32);

        if (existing && existing.hash === hashBuffer) {
            // Documento já vetorizado e não sofreu mudança de texto
            continue;
        }

        try {
            const vector = await generateEmbedding(doc.content, doc.title);
            if (vector && vector.length > 0) {
                // Upsert no map
                vectorMap.set(doc.id, {
                    id: doc.id,
                    type: doc.type,
                    title: doc.title,
                    hash: hashBuffer,
                    contentSummary: doc.content, // Guardamos o texto crú para uso no contexto RAG (Top-K)
                    link: doc.link,
                    vector: vector
                });
                newEmbeddingsCount++;
            }

            // Rate Limit
            if (newEmbeddingsCount > 0) {
                await new Promise(res => setTimeout(res, 3000)); // Sleep de 3s
            }
        } catch (e) {
            console.error(`   ❌ Falha ao processar "${doc.title}": ${e.message}`);
        }
    }

    if (newEmbeddingsCount === 0) {
        console.log('\n✅ Base Vetorial (vectors.json) já está atualizada. Nenhum embedding novo foi gerado.');
        return;
    }

    // 4. Salvar Base Vetorial Final
    const finalArray = Array.from(vectorMap.values());
    writeFileSync(VECTORS_JSON_PATH, JSON.stringify(finalArray, null, 2) + '\n');

    console.log(`\n🎉 Processamento concluído! ${newEmbeddingsCount} novos Embeddings gerados.`);
    console.log(`📦 Database Vectorial salva em: assets/data/vectors.json (${finalArray.length} dimensões locais).`);
}

main().catch(err => {
    console.error('\n💥 Erro fatal no gerador de Embeddings:', err.message);
    process.exit(1);
});

#!/usr/bin/env node
/**
 * generate-embeddings.mjs
 * Pipeline Autônomo: TODOS os Repos + Certificados → Gemini Embeddings → vectors.json
 *
 * Fluxo:
 *   1. Busca TODOS os repositórios públicos via GitHub GraphQL API
 *   2. Puxa README de cada repo via REST API
 *   3. Carrega assets/data/projects.json (pinned — dados enriquecidos pelo Gemini)
 *   4. Carrega assets/data/certificates.json (se existir)
 *   5. Combina tudo, gera embeddings incrementais via gemini-embedding-001
 *   6. Salva em assets/data/vectors.json
 *
 * @version 2.0.0 (Story 9.2 — Full Repos Coverage)
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
const GITHUB_USER = 'Jcnok';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL = 'gemini-embedding-001'; // Free Tier: 100 RPM / 1000 RPD
const MAX_README_CHARS = 3000; // Truncar READMEs para não estourar o limite de tokens do embedding

// ---------------------------------------------------------------------------
// Retry Wrapper (Exponential Backoff)
// ---------------------------------------------------------------------------
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
// GitHub GraphQL — Buscar TODOS os repos públicos (até 100)
// ---------------------------------------------------------------------------
async function fetchAllPublicRepos() {
    console.log('📂 Buscando TODOS os repositórios públicos no GitHub...');

    const query = `{
    user(login: "${GITHUB_USER}") {
      repositories(first: 100, isFork: false, ownerAffiliations: OWNER, privacy: PUBLIC, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          name
          description
          url
          primaryLanguage { name }
          repositoryTopics(first: 10) {
            nodes { topic { name } }
          }
        }
      }
    }
  }`;

    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'portfolio-embeddings-generator',
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        throw new Error(`GitHub GraphQL API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
        throw new Error(`GitHub GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const repos = data.data.user.repositories.nodes;
    console.log(`   ✅ ${repos.length} repositórios públicos encontrados`);
    return repos;
}

// ---------------------------------------------------------------------------
// GitHub REST — Buscar README de um repo
// ---------------------------------------------------------------------------
async function fetchReadme(repoName) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${repoName}/readme`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'portfolio-embeddings-generator',
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return content.slice(0, MAX_README_CHARS);
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Formatar nome do repo: kebab-case → Title Case
// ---------------------------------------------------------------------------
function formatTitle(name) {
    return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// API Gemini: Gera o Vector Float Array para um texto base
// ---------------------------------------------------------------------------
async function generateEmbedding(text, title) {
    console.log(`   🧠 Embedding: "${title}"`);

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
// Pipeline Principal
// ---------------------------------------------------------------------------
async function main() {
    console.log('🚀 Iniciando processamento de embeddings (Zero-Ops RAG v2)...\n');

    if (!GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY não configurada!');
        process.exit(1);
    }

    // Carregar vetores existentes (cache incremental)
    let existingVectors = [];
    try {
        if (existsSync(VECTORS_JSON_PATH)) {
            existingVectors = JSON.parse(readFileSync(VECTORS_JSON_PATH, 'utf-8'));
        }
    } catch {
        console.warn('⚠️ Falha ao ler vectors.json. Criando nova base.');
    }

    const vectorMap = new Map();
    existingVectors.forEach(v => vectorMap.set(v.id, v));

    const docsToEmbed = [];

    // =========================================================================
    // FONTE 1: Projetos Pinados (dados enriquecidos pelo Gemini — projects.json)
    // =========================================================================
    const pinnedNames = new Set();
    if (existsSync(PROJECTS_JSON_PATH)) {
        const projects = JSON.parse(readFileSync(PROJECTS_JSON_PATH, 'utf-8'));
        projects.forEach(p => {
            // Marcar como pinado para não duplicar quando varrermos todos os repos
            pinnedNames.add(p.title.toLowerCase().replace(/\s+/g, '-'));
            // ID format: project_{title_kebab} para ser estável entre runs
            const stableId = `project_pinned_${p.title.toLowerCase().replace(/\s+/g, '-')}`;
            const textContent = [
                `PROJETO PINADO: ${p.title}`,
                `CATEGORIA: ${p.category}`,
                `SKILLS: ${p.tags?.join(', ')}`,
                `DESCRIÇÃO: ${p.description}`,
                `RESUMO GEMINI: ${p.resume}`,
            ].join('\n');
            docsToEmbed.push({
                id: stableId,
                type: 'project',
                title: `⭐ ${p.title}`,
                content: textContent,
                link: p.codeUrl || '#'
            });
        });
        console.log(`⭐ ${projects.length} projetos pinados carregados de projects.json`);
    }

    // =========================================================================
    // FONTE 2: TODOS os Repos Públicos (GitHub GraphQL + README)
    // =========================================================================
    if (GITHUB_TOKEN) {
        const allRepos = await fetchAllPublicRepos();

        console.log('\n📄 Buscando READMEs dos repositórios...');
        let readmeCount = 0;

        for (const repo of allRepos) {
            // Pular repos que já foram indexados como pinados (evita duplicata)
            if (pinnedNames.has(repo.name.toLowerCase())) {
                continue;
            }

            const readme = await fetchReadme(repo.name);
            const topics = repo.repositoryTopics?.nodes?.map(n => n.topic.name) || [];
            const language = repo.primaryLanguage?.name || 'N/A';

            const textContent = [
                `REPOSITÓRIO: ${formatTitle(repo.name)}`,
                `LINGUAGEM: ${language}`,
                `TÓPICOS: ${topics.join(', ') || 'N/A'}`,
                `DESCRIÇÃO: ${repo.description || 'Sem descrição'}`,
                readme ? `README:\n${readme}` : '',
            ].filter(Boolean).join('\n');

            const stableId = `repo_${repo.name.toLowerCase()}`;
            docsToEmbed.push({
                id: stableId,
                type: 'repository',
                title: formatTitle(repo.name),
                content: textContent,
                link: repo.url
            });

            if (readme) readmeCount++;
        }

        console.log(`   ✅ ${allRepos.length - pinnedNames.size} repos adicionais processados (${readmeCount} com README)`);
    } else {
        console.warn('⚠️ GITHUB_TOKEN não configurado. Pulando ingestão de repos completos.');
    }

    // =========================================================================
    // FONTE 3: Certificados
    // =========================================================================
    if (existsSync(CERTS_JSON_PATH)) {
        const certs = JSON.parse(readFileSync(CERTS_JSON_PATH, 'utf-8'));
        certs.forEach(c => {
            const stableId = `cert_${c.driveFileId || c.id}`;
            const textContent = [
                `CERTIFICADO: ${c.title}`,
                `INSTITUIÇÃO: ${c.institution || 'N/A'}`,
                `CARGA HORÁRIA: ${c.hours || 'N/A'}h`,
                `DATA: ${c.completionDate || 'N/A'}`,
                `SKILLS: ${c.skills?.join(', ') || 'N/A'}`,
                `DESCRIÇÃO: ${c.description || ''}`,
            ].join('\n');
            docsToEmbed.push({
                id: stableId,
                type: 'certificate',
                title: c.title,
                content: textContent,
                link: '#'
            });
        });
        console.log(`🎓 ${certs.length} certificados carregados`);
    }

    console.log(`\n📋 Total de documentos para embeddings: ${docsToEmbed.length}`);

    // =========================================================================
    // Processamento Incremental de Embeddings
    // =========================================================================
    let newCount = 0;
    let skipCount = 0;

    for (const doc of docsToEmbed) {
        const existing = vectorMap.get(doc.id);
        const hashBuffer = Buffer.from(doc.content).toString('base64').substring(0, 32);

        if (existing && existing.hash === hashBuffer) {
            skipCount++;
            continue;
        }

        try {
            const vector = await generateEmbedding(doc.content, doc.title);
            if (vector && vector.length > 0) {
                vectorMap.set(doc.id, {
                    id: doc.id,
                    type: doc.type,
                    title: doc.title,
                    hash: hashBuffer,
                    contentSummary: doc.content,
                    link: doc.link,
                    vector: vector
                });
                newCount++;
            }

            // Rate limiter suave: 1s entre requests (100 RPM = ~1.7/s, margem segura)
            await new Promise(res => setTimeout(res, 1000));
        } catch (e) {
            console.error(`   ❌ Falha: "${doc.title}": ${e.message}`);
        }
    }

    if (skipCount > 0) {
        console.log(`\n⏭️  ${skipCount} documentos já estavam atualizados (skip)`);
    }

    if (newCount === 0) {
        console.log('✅ Base Vetorial já está 100% atualizada. Nenhum embedding novo gerado.');
        return;
    }

    // Salvar
    const finalArray = Array.from(vectorMap.values());
    writeFileSync(VECTORS_JSON_PATH, JSON.stringify(finalArray, null, 2) + '\n');

    console.log(`\n🎉 ${newCount} novos embeddings gerados!`);
    console.log(`📦 vectors.json: ${finalArray.length} documentos totais (~${Math.round(JSON.stringify(finalArray).length / 1024)}KB)`);
}

main().catch(err => {
    console.error('\n💥 Erro fatal:', err.message);
    process.exit(1);
});

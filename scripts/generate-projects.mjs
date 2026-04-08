#!/usr/bin/env node
/**
 * generate-projects.mjs
 * Pipeline autônomo: GitHub Pinned Repos → Gemini Analysis → projects.json
 *
 * Uso: GITHUB_TOKEN=xxx GEMINI_API_KEY=xxx node scripts/generate-projects.mjs
 *
 * @version 1.0.0 (Story 3.1)
 */

import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS_JSON_PATH = resolve(__dirname, '../assets/data/projects.json');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const GITHUB_USER = 'Jcnok';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_README_CHARS = 2000;

// ---------------------------------------------------------------------------
// 1. GitHub GraphQL — Fetch Pinned Repos
// ---------------------------------------------------------------------------
async function fetchPinnedRepos() {
    console.log('📌 Buscando repositórios pinados...');

    const query = `{
    user(login: "${GITHUB_USER}") {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            homepageUrl
            primaryLanguage { name }
            repositoryTopics(first: 10) {
              nodes { topic { name } }
            }
            openGraphImageUrl
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
            'User-Agent': 'portfolio-generator',
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        throw new Error(`GitHub GraphQL API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
        throw new Error(`GitHub GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const repos = data.data.user.pinnedItems.nodes;
    console.log(`   ✅ ${repos.length} repos pinados encontrados`);
    return repos;
}

// ---------------------------------------------------------------------------
// 2. GitHub REST — Fetch README de cada repo
// ---------------------------------------------------------------------------
async function fetchReadme(repoName) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${repoName}/readme`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'portfolio-generator',
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        // README vem em base64
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return content;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// 3. Extrair primeira imagem real do README (não badges)
// ---------------------------------------------------------------------------
function extractCoverImage(readme, repoName) {
    if (!readme) return null;

    // Regex para imagens em markdown: ![alt](url)
    const imageRegex = /!\[.*?\]\((.*?\.(png|jpg|jpeg|gif|webp).*?)\)/gi;
    const matches = [...readme.matchAll(imageRegex)];

    for (const match of matches) {
        const url = match[1];

        // Filtrar badges (shields.io, badgen.net, img.shields.io, etc.)
        if (/shields\.io|badgen\.net|badge/i.test(url)) continue;

        // Converter paths relativos para URLs absolutas do raw.githubusercontent
        if (url.startsWith('http')) return url;

        // Path relativo: ./img/foo.png ou img/foo.png
        const cleanPath = url.replace(/^\.\//, '');
        return `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/main/${cleanPath}`;
    }

    // Também checar img tags HTML
    const htmlImgRegex = /<img[^>]+src=["'](.*?\.(png|jpg|jpeg|gif|webp).*?)["']/gi;
    const htmlMatches = [...readme.matchAll(htmlImgRegex)];

    for (const match of htmlMatches) {
        const url = match[1];
        if (/shields\.io|badgen\.net|badge/i.test(url)) continue;

        if (url.startsWith('http')) return url;
        const cleanPath = url.replace(/^\.\//, '');
        return `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/main/${cleanPath}`;
    }

    return null;
}

// ---------------------------------------------------------------------------
// 4. Gemini 2.5 Flash — Análise criativa em batch
// ---------------------------------------------------------------------------
async function enrichWithGemini(repos) {
    if (!GEMINI_API_KEY) {
        console.log('   ⚠️ GEMINI_API_KEY não configurada, usando fallback');
        return null;
    }

    console.log('🤖 Chamando Gemini 2.5 Flash para análise criativa...');

    const repoSummaries = repos.map((r) => ({
        name: r.name,
        description: r.description || 'Sem descrição',
        language: r.language,
        topics: r.topics,
        readme: r.readmeContent ? r.readmeContent.slice(0, MAX_README_CHARS) : 'README não disponível',
    }));

    const prompt = `Você é um consultor de portfólio especializado em Data Science, AI e Engenharia de Dados.

Analise os repositórios abaixo e para CADA um retorne:
1. "summary": Resumo estratégico de 2-3 frases em português, focado em impacto técnico e tecnologias. Deve impressionar recrutadores técnicos. Seja direto e objetivo.
2. "category": Uma categoria entre: "data-analysis", "machine-learning", "cloud", "web-development", "ai-automation"
3. "highlightTags": Array de 3-5 tags priorizadas (as mais relevantes do projeto)

REPOSITÓRIOS:
${JSON.stringify(repoSummaries, null, 2)}

REGRAS:
- Responda APENAS em JSON válido, sem markdown, sem code fences
- O JSON deve ser um array com um objeto para cada repositório
- Cada objeto deve ter: "name", "summary", "category", "highlightTags"
- Use português do Brasil
- Resumos devem ser profissionais e impressionar recrutadores`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        responseMimeType: 'application/json',
                    },
                }),
            }
        );

        if (!response.ok) {
            const err = await response.json();
            console.error('   ❌ Gemini API error:', err.error?.message);
            return null;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.log('   ⚠️ Gemini retornou resposta vazia');
            return null;
        }

        // Parse JSON da resposta (remover possíveis code fences)
        const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const enriched = JSON.parse(cleanJson);
        console.log(`   ✅ ${enriched.length} repos enriquecidos pelo Gemini`);
        return enriched;
    } catch (error) {
        console.error('   ❌ Erro ao chamar Gemini:', error.message);
        return null;
    }
}

// ---------------------------------------------------------------------------
// 5. Fallback — categorização básica sem Gemini
// ---------------------------------------------------------------------------
function fallbackEnrich(repo) {
    const langCategoryMap = {
        Python: 'data-analysis',
        JavaScript: 'web-development',
        TypeScript: 'web-development',
        'Jupyter Notebook': 'data-analysis',
        HTML: 'web-development',
        R: 'data-analysis',
    };

    return {
        summary: repo.description || `Projeto ${repo.name} desenvolvido com ${repo.language || 'múltiplas tecnologias'}.`,
        category: langCategoryMap[repo.language] || 'web-development',
        highlightTags: repo.topics.slice(0, 5),
    };
}

// ---------------------------------------------------------------------------
// 6. Formatar nome do repo: kebab-case → Title Case
// ---------------------------------------------------------------------------
function formatTitle(name) {
    return name
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// 7. Main Pipeline
// ---------------------------------------------------------------------------
async function main() {
    console.log('🚀 Iniciando pipeline de geração de projetos...\n');

    if (!GITHUB_TOKEN) {
        console.error('❌ GITHUB_TOKEN não configurado!');
        process.exit(1);
    }

    // Step 1: Fetch pinned repos
    const pinnedRepos = await fetchPinnedRepos();

    // Step 2: Fetch README e extrair capa de cada repo
    console.log('\n📄 Buscando READMEs e extraindo capas...');
    const enrichedRepos = [];

    for (const repo of pinnedRepos) {
        const readme = await fetchReadme(repo.name);
        const coverImage = extractCoverImage(readme, repo.name);
        const topics = repo.repositoryTopics.nodes.map((n) => n.topic.name);

        // Usar OG image como fallback se não encontrou no README
        const ogImage = repo.openGraphImageUrl;
        const isGenericOG = ogImage?.includes('opengraph.githubassets.com');
        const finalCover = coverImage || (!isGenericOG ? ogImage : null);

        console.log(`   ${finalCover ? '🖼️' : '⬜'} ${repo.name}: ${finalCover ? 'capa encontrada' : 'sem capa (usará placeholder)'}`);

        enrichedRepos.push({
            name: repo.name,
            description: repo.description,
            url: repo.url,
            homepageUrl: repo.homepageUrl || '',
            language: repo.primaryLanguage?.name || 'Unknown',
            topics,
            coverImage: finalCover,
            readmeContent: readme,
        });
    }

    // Step 3: Gemini enrichment
    console.log('');
    const geminiResults = await enrichWithGemini(enrichedRepos);

    // Step 4: Build final projects.json
    console.log('\n📦 Gerando projects.json...');
    const projects = enrichedRepos.map((repo, index) => {
        // Encontrar dados do Gemini para este repo
        const gemini = geminiResults?.find((r) => r.name === repo.name) || fallbackEnrich(repo);

        return {
            id: index + 1,
            title: formatTitle(repo.name),
            description: gemini.summary || repo.description || '',
            image: repo.coverImage || 'assets/images/projects/default-project.png',
            category: gemini.category || 'web-development',
            tags: gemini.highlightTags || repo.topics.slice(0, 5),
            codeUrl: repo.url,
            demoUrl: repo.homepageUrl || repo.url,
        };
    });

    // Step 5: Comparar com o JSON existente e salvar se mudou
    let existingJson = '';
    try {
        existingJson = readFileSync(PROJECTS_JSON_PATH, 'utf-8');
    } catch {
        // arquivo não existe ainda
    }

    const newJson = JSON.stringify(projects, null, 2) + '\n';

    if (existingJson === newJson) {
        console.log('\n✅ Nenhuma mudança detectada. projects.json está atualizado.');
        return;
    }

    writeFileSync(PROJECTS_JSON_PATH, newJson);
    console.log(`\n✅ projects.json atualizado com ${projects.length} projetos!`);
    console.log('   Arquivo: assets/data/projects.json');

    // Log resumo
    console.log('\n📋 Resumo:');
    projects.forEach((p) => {
        console.log(`   ${p.image ? '🖼️' : '⬜'} ${p.title} [${p.category}] — ${p.tags.join(', ')}`);
    });
}

main().catch((err) => {
    console.error('\n💥 Erro fatal:', err.message);
    process.exit(1);
});

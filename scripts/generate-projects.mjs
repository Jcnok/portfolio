#!/usr/bin/env node
/**
 * generate-projects.mjs
 * Pipeline autônomo: GitHub Pinned Repos → Gemini Analysis → projects.json
 *
 * Uso: GITHUB_TOKEN=xxx GEMINI_API_KEY=xxx node scripts/generate-projects.mjs
 *
 * @version 1.0.0 (Story 3.1)
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS_JSON_PATH = resolve(__dirname, '../assets/data/projects.json');
const IMAGES_DIR = resolve(__dirname, '../assets/images/projects');

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
const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';
const MAX_README_CHARS = 2000;

// Create images dir if not exists
if (!existsSync(IMAGES_DIR)) {
    mkdirSync(IMAGES_DIR, { recursive: true });
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
// 6.5 Generative AI Image Fallback (Gemini SVG Gen)
// ---------------------------------------------------------------------------
async function generateFallbackImage(repoName, category, tags) {
    const filename = `${repoName.toLowerCase()}.svg`;
    const filepath = join(IMAGES_DIR, filename);
    const localUrl = `assets/images/projects/${filename}`;

    // Avoid regenerating if we already generated it previously
    if (existsSync(filepath)) {
        return localUrl;
    }

    console.log(`   🎨 Gerando SVG via Gemini para: ${repoName}...`);

    const title = formatTitle(repoName);
    const tagsStr = tags && tags.length > 0 ? tags.join(' | ') : category;

    // Calcula tamanho ideal da fonte para não estourar a viewBox (800px)
    // Assumimos que cada caractere ocupa aprox 60% do font-size.
    const titleSize = Math.max(20, Math.min(55, Math.floor(750 / (title.length * 0.6))));
    const tagsSize = Math.max(14, Math.min(22, Math.floor(750 / (tagsStr.length * 0.5))));

    const prompt = `Gere APENAS um código SVG válido e extremamente estético (tamanho 800x280) representando o projeto de tecnologia chamado "${title}".
    O SVG deve usar tema "Dark Mode" (fundos escuros, azul/roxo vibrante, cyberpunk, gradients), efeitos de brilho (glowing effects), malha/grid no fundo.
    Centralize o título "${title}" com muito destaque (tamanho da fonte EXATAMENTE ${titleSize}px). 
    Abaixo do título, inclua os textos: "${tagsStr}" (tamanho da fonte EXATAMENTE ${tagsSize}px, texto claro).
    Garanta que NADA do texto fique cortado nas laterais, utilize OBRIGATORIAMENTE "text-anchor='middle'" no SVG.
    Use uma fonte limpa "sans-serif" ou "Roboto".
    Faça uso de quebra de linhas no SVG (<tspan>) se achar que a string das linguagens ficou comprida demais.
    RETORNE APENAS O CÓDIGO DO SVG (pode vir no bloco \`\`\`xml) e NADA MAIS.`;

    try {
        const response = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7 },
                }),
            }
        );

        if (!response.ok) {
            console.error('   ❌ Falha na API Gemini para gerar SVG.');
            return 'assets/images/projects/default-project.png';
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return 'assets/images/projects/default-project.png';
        }

        // Extrair o SVG verdadeiro ignorando formatação extra
        const match = text.match(/<svg[\s\S]*?<\/svg>/i);
        if (match) {
            writeFileSync(filepath, match[0]);
            console.log(`   ✅ Capa SVG gerada e salva: ${filename}`);
            return localUrl;
        }

        return 'assets/images/projects/default-project.png';
    } catch (error) {
        console.error('   ❌ Falha ao gerar SVG:', error.message);
        return 'assets/images/projects/default-project.png';
    }
}

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
            defaultBranchRef { name }
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
function extractCoverImage(readme, repoName, defaultBranch) {
    const branch = defaultBranch || 'main';
    if (!readme) return null;

    // Regex para imagens em markdown: ![alt](url)
    const imageRegex = /!\[.*?\]\((.*?\.(png|jpg|jpeg|gif|webp).*?)\)/gi;
    const matches = [...readme.matchAll(imageRegex)];

    for (const match of matches) {
        const url = match[1];

        // Filtrar badges (shields.io, badgen.net, img.shields.io, andreasbm, etc.)
        if (/shields\.io|badgen\.net|badge|andreasbm|line/i.test(url)) continue;

        // Converter paths relativos para URLs absolutas do raw.githubusercontent
        if (url.startsWith('http')) return url;

        // Path relativo: ./img/foo.png ou img/foo.png
        const cleanPath = url.replace(/^\.\//, '');
        return `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/${branch}/${cleanPath}`;
    }

    // Também checar img tags HTML
    const htmlImgRegex = /<img[^>]+src=["'](.*?\.(png|jpg|jpeg|gif|webp).*?)["']/gi;
    const htmlMatches = [...readme.matchAll(htmlImgRegex)];

    for (const match of htmlMatches) {
        const url = match[1];
        if (/shields\.io|badgen\.net|badge|andreasbm|line/i.test(url)) continue;

        if (url.startsWith('http')) return url;
        const cleanPath = url.replace(/^\.\//, '');
        return `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/${branch}/${cleanPath}`;
    }

    return null;
}

async function fetchWithRetry(url, options, retries = 3, delayMs = 15000) {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, options);
        if (response.ok) return response;

        const err = await response.json();
        const code = err?.error?.code || response.status;
        if (code !== 429 && code !== 503) {
            throw new Error(err?.error?.message || 'Erro desconhecido da API');
        }

        if (i < retries - 1) {
            console.log(`   ⏳ API ocupada (Erro ${code}). Tentando novamente em ${delayMs / 1000}s...`);
            await new Promise(r => setTimeout(r, delayMs));
        } else {
            throw new Error(`Falha persistente após ${retries} tentativas: ${err?.error?.message}`);
        }
    }
}

// ---------------------------------------------------------------------------
// 4. Gemini — Análise criativa em batch
// ---------------------------------------------------------------------------
async function enrichWithGemini(repos) {
    if (!GEMINI_API_KEY) {
        console.log('   ⚠️ GEMINI_API_KEY não configurada, usando fallback');
        return null;
    }

    console.log(`🤖 Chamando ${GEMINI_MODEL} para análise criativa...`);

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
        const response = await fetchWithRetry(
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
        // default branch ou main fallback
        const branchName = repo.defaultBranchRef?.name || 'main';
        const coverImage = extractCoverImage(readme, repo.name, branchName);
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
    const projects = [];

    for (let index = 0; index < enrichedRepos.length; index++) {
        const repo = enrichedRepos[index];
        // Encontrar dados do Gemini para este repo
        const gemini = geminiResults?.find((r) => r.name === repo.name) || fallbackEnrich(repo);

        // Limita a descrição natural do github se não existir
        const nativeDesc = repo.description || `Projeto de código aberto: ${formatTitle(repo.name)}`;

        let coverImg = repo.coverImage;
        if (!coverImg) {
            // Aguarda 5 segundos entre as requisições de geração de imagem para evitar Quota Limit do Gemini
            await new Promise(r => setTimeout(r, 5000));
            coverImg = await generateFallbackImage(repo.name, gemini.category || 'tech', gemini.highlightTags || repo.topics.slice(0, 5));
        }

        projects.push({
            id: index + 1,
            title: formatTitle(repo.name),
            description: nativeDesc,
            resume: gemini.summary || nativeDesc,
            image: coverImg,
            category: gemini.category || 'web-development',
            tags: gemini.highlightTags || repo.topics.slice(0, 5),
            codeUrl: repo.url,
            demoUrl: repo.homepageUrl || repo.url,
        });
    }

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

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LANGUAGES_JSON_PATH = resolve(__dirname, '../assets/data/languages.json');

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

// ---------------------------------------------------------------------------
// 1. Fetch Todos Repositórios do Usuário na API GraphQL
// ---------------------------------------------------------------------------
async function fetchAllReposMetadata() {
    console.log('📊 Buscando metadados globais de repositórios no GitHub...');

    const query = `{
    user(login: "${GITHUB_USER}") {
      repositories(first: 100, isFork: false, ownerAffiliations: OWNER, privacy: PUBLIC) {
        nodes {
          name
          languages(first: 10) {
            edges {
              size
              node { name }
            }
          }
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
            'User-Agent': 'portfolio-skills-generator',
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        throw new Error(`GitHub GraphQL API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.user.repositories.nodes;
}

// ---------------------------------------------------------------------------
// 2. Análise da IA Generativa usando os dados consolidados
// ---------------------------------------------------------------------------
async function generateSkillsJSON(languageStats, topicStats) {
    console.log('🤖 Solicitando avaliação Data-Driven de Skills ao Gemini 2.5...');

    const prompt = `Você é um Analista de Perfil Técnico Especialista em Carreiras Tech.
Dado o agrupamento real de commits, tópicos e bytes de código extraídos do GitHub do desenvolvedor Jcnok, sua tarefa é compilar o "Gráfico Radar de Habilidades" (Radar Chart).
O desenvolvedor está em transição para Automação com IA, Dados e Cloud.

DADOS BRUTOS (Bytes de código escritos por linguagem):
${JSON.stringify(languageStats, null, 2)}

DADOS BRUTOS (Frequência de Uso de Tecnologias/Tópicos por repo):
${JSON.stringify(topicStats, null, 2)}

INSTRUÇÕES:
1. Agrupe as métricas brutas em 6 a 8 nomes de habilidades muito atrativas para as áreas citadas (ex: "Python (Dados e Automação)" agrupando Jupyter, Python, e tópicos numpy/pandas; "Cloud & DevOps (Azure/Docker)" agrupando tópicos docker/azure).
2. Estipule a porcentagem (valor numérico inteiro de 1 a 100) baseando-se na presença real de bytes e recorrência no portfólio. Avalie a predominância nos dados e traduza em maestria.
3. Não use exatamente "Jupyter Notebook". Considere isso parte de "Data Analysis / Python".
4. Se vir tópicos fortes na stack (como "n8n", "LLM", "Prompt Engineering") construa um eixo no gráfico para eles também.

RETORNE APENAS UM JSON VÁLIDO no seguinte formato (e nada mais):
{
  "Nome Extenso e Descritivo da Skill": 85,
  "Outra Skill (Contexto)": 72
}`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: "Você retorna exclusivamente código JSON sintaticamente válido, sem formatações ou markdown em volta." }]
                },
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1 },
            }),
        }
    );

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Gemini API error: ${JSON.stringify(err)}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Tratamento caso a IA retorne markdown acidental
    text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    return JSON.parse(text);
}

// ---------------------------------------------------------------------------
// 3. Pipeline Principal
// ---------------------------------------------------------------------------
async function main() {
    console.log('🚀 Iniciando cálculo autonômo de Skills (Gráfico Data-Driven)...\n');

    if (!GITHUB_TOKEN) {
        console.error('❌ GITHUB_TOKEN não configurado!');
        process.exit(1);
    }
    if (!GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY não configurada!');
        process.exit(1);
    }

    // Step 1: Extrair
    const repos = await fetchAllReposMetadata();
    console.log(`   ✅ Lidos ${repos.length} repositórios com sucesso.\n`);

    // Step 2: Consolidar Bytes e Frequência
    const languageStats = {};
    const topicStats = {};

    for (const repo of repos) {
        // Acúmulo de bytes das linguagens do repositório
        if (repo.languages && repo.languages.edges) {
            for (const edge of repo.languages.edges) {
                const langName = edge.node.name;
                languageStats[langName] = (languageStats[langName] || 0) + edge.size;
            }
        }

        // Contagem de recorrência dos Tópicos (tech stack features)
        if (repo.repositoryTopics && repo.repositoryTopics.nodes) {
            for (const n of repo.repositoryTopics.nodes) {
                const topicName = n.topic.name;
                topicStats[topicName] = (topicStats[topicName] || 0) + 1;
            }
        }
    }

    // Ordenar e isolar as estatísticas principais
    const sortedLang = Object.fromEntries(Object.entries(languageStats).sort(([, a], [, b]) => b - a));
    const sortedTopics = Object.fromEntries(Object.entries(topicStats).sort(([, a], [, b]) => b - a));

    console.log('📌 Top 5 Linguagens brutos identificados pelo Git:');
    console.log(Object.entries(sortedLang).slice(0, 5).map(([k, v]) => `   - ${k}: ${v} bytes`).join('\n'));
    console.log('\n📌 Top 5 Tópicos (Tech Stack) mais usados:');
    console.log(Object.entries(sortedTopics).slice(0, 5).map(([k, v]) => `   - ${k}: ${v} projetos`).join('\n'));
    console.log('');

    // Step 3: IA Geradora
    const smartSkillsMap = await generateSkillsJSON(sortedLang, sortedTopics);

    // Step 4: Salvar e Comparar
    let existingJson = '';
    try {
        existingJson = readFileSync(LANGUAGES_JSON_PATH, 'utf-8');
    } catch { }

    const newJson = JSON.stringify(smartSkillsMap, null, 2) + '\n';

    if (existingJson === newJson) {
        console.log('\n✅ Nenhuma mudança no baseline de conhecimento. languages.json continua o mesmo.');
        return;
    }

    writeFileSync(LANGUAGES_JSON_PATH, newJson);
    console.log(`\n✅ Gráfico atualizado Data-Driven salvo em assets/data/languages.json`);
    console.log('📋 Novo Modelo Dinâmico de Carreira:');
    Object.entries(smartSkillsMap).forEach(([k, v]) => {
        console.log(`   🔸 ${k}: ${v}%`);
    });
}

main().catch((err) => {
    console.error('\n💥 Erro fatal:', err.message);
    process.exit(1);
});

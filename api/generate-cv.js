export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { jobDescription } = req.body || {};

    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
        return res.status(400).json({ error: 'A descriçāo da vaga é obrigatória.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    // Profile estático extraído do portfólio para embasar o agente e não inventar nada
    const JULIO_PROFILE = `
  Nome: Julio Cesar Okuda
  Resumo: Em transição de carreira da Infraestrutura de TI para Automação com IA, Dados e Cloud.
  Habilidades Principais: Python, SQL, Azure, Docker, LangChain, Agentes Autônomos (MCP, n8n), Machine Learning.
  
  Experiência Profissional:
  - 2023 - Presente: Projetos Pessoais & Freelance (Automação com IA e Dados) - Desenvolvimento em Python, n8n, APIs, RAG, Assistentes Virtuais.
  - 2023 - Presente: Estudos & Bootcamps - Formação intensiva em Python, SQL, Azure, ML. MBAs em Data Science e Cloud Computing.
  - 2018 - 2023: Analista de Suporte / Infraestrutura - Sustentação de ambientes de TI, resolução de incidentes, administração SO/redes.
  
  Projetos Principais (GitHub: Jcnok):
  1. Desafio Langflow: Plataforma de atendimento com Langflow + OpenAI + CRM (Docker, Semantic-Router).
  2. Crm System: Pipeline dbt + Streamlit + LangChain (Gemini) para SQL e KPIs.
  3. ROI Calculator (Hackathon Microsoft 2025): Ferramenta de análise preditiva com Azure OpenAI e Python.
  4. Stack Labs Churn: Modelo ML preditivo (Scikit-learn, Pandas) para retenção de clientes.
  5. Central Atendimento Azure: Orquestrador de agentes RAG com PostgreSQL/pgvector e FastAPI.
  6. CRM Skynet: Sistema RESTful SQLite+FastAPI focado em engenharia de dados.
  
  Certificações: Microsoft Certified Associate (Data Scientist), Azure AI Fundamentals (AI-900), Azure Data Fundamentals (DP-900), AWS Cloud Practitioner.
  Contatos: Email: julio.okuda@gmail.com | LinkedIn: juliookuda
  `;

    const systemInstruction = `Você é o **Assistente de Currículo do Julio**, um especialista em recrutamento e otimização para sistemas ATS.
Sua missão é ajudar Julio a se candidatar a vagas informadas pelos usuários usando APENAS as informações de seu perfil, sem NUNCA inventar nada.

DADOS REAIS DO JULIO:
${JULIO_PROFILE}

### Seu processo interno:
1. Extraia palavras-chave e requisitos da vaga enviada.
2. Mapeie o perfil do Julio.
3. Calcule % de compatibilidade real (obrigatórios 70%, desejáveis 30%).
4. Identifique lacunas e fortalezas.

### Output obrigatório (em Markdown limpo, estruturado e português claro, SEM o processo mental!):

#### 1. RELATÓRIO DE COMPATIBILIDADE
- **Percentual de compatibilidade** (ex: 78%)
- **Atende aos obrigatórios?** Sim/Não (comente).
- **Pontos fortes para esta vaga** (máx. 3 focados no perfil real).
- **Lacunas reais** (máx. 2, sem mentir).
- **Recomendação**: candidatar-se ou não?

#### 2. CURRÍCULO PERSONALIZADO (ATS-friendly)
- Nome e contatos (dados reais do perfil)
- Resumo Profissional (alinhado com as palavras-chave da vaga, sem inventar)
- Habilidades Técnicas (apenas as que possui que batem com a vaga)
- Projetos Relevantes (selecione máximo 3 do perfil dele que façam sentido para a vaga, mencione métricas ou techs exatas descritas).
- Experiência Profissional (reordene para destacar autonomia com testes/IA se necessário, baseando-se no perfil).
- Formação e certificações (somente as confirmadas).

#### 3. CARTA DE APRESENTAÇÃO
- Sugestão de texto para email ou linkedin destacando porquê os projetos do Julio resolvem o problema da vaga. (1-2 parágrafos).`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ role: 'user', parts: [{ text: `VAGA: \n${jobDescription}` }] }],
                    generationConfig: { temperature: 0.2 },
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error: ", data);
            return res.status(502).json({ error: "Serviço de IA falhou. Tente novamente mais tarde." });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Nenhum resultado gerado.';

        res.status(200).json({ reply });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(502).json({ error: 'Network error or Timeout.' });
    }
}

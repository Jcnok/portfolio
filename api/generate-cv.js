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

    const JULIO_PROFILE = `
  Nome: Julio Cesar Okuda
  Contatos: Email: julio.okuda@gmail.com | LinkedIn: https://linkedin.com/in/juliookuda | GitHub: https://github.com/Jcnok
  Resumo: Em transição de carreira da Infraestrutura de TI para Automação com IA, Dados e Cloud.
  Habilidades Principais: Python, SQL, Azure, Docker, LangChain, Agentes Autônomos (MCP, n8n), Machine Learning.
  
  Experiência Profissional:
  - 2023 - Presente: Projetos Pessoais & Freelance (Automação com IA e Dados) - Desenvolvimento em Python, n8n, APIs, RAG, Assistentes Virtuais.
  - 2018 - 2023: Analista de Suporte / Infraestrutura - Sustentação de ambientes de TI, resolução de incidentes, administração SO/redes.
  
  Formação Acadêmica:
  - MBA em Data Science e Analytics - USP/Esalq (Concluído)
  - MBA em Cloud Computing - FIAP (Concluído)
  - Tecnólogo em Redes de Computadores - UNINOVE (Concluído)
  
  Certificações: 
  - Azure AI Engineer Associate | Microsoft | 2024
  - AWS Cloud Quest: Cloud Practitioner | AWS | 2023
  - Azure AI Fundamentals | Microsoft | 2022
  - Azure Data Fundamentals | Microsoft | 2022
  
  Projetos Principais (Sempre adicione no currículo com seus respectivos links do GitHub quando citá-los):
  1. Langflow Call Center Assistant (https://github.com/Jcnok/langflow-challenge) - Plataforma de atendimento com Langflow + OpenAI + CRM (Docker, Semantic-Router).
  2. dbt-Core Pipeline (https://github.com/Jcnok/dbt-pipeline) - Pipeline dbt + Streamlit + LangChain (Gemini) para SQL e KPIs.
  3. ROI Calculator (Hackathon Microsoft) - Ferramenta preditiva com Azure OpenAI e Python.
  4. Stack Labs Churn (https://github.com/Jcnok/Stack_Labs_Churn) - Modelo ML preditivo (Scikit-learn, Pandas) para retenção.
  5. Contato Fácil RAG Azure (https://github.com/Jcnok/contato-facil-azure) - Orquestrador de agentes RAG com PostgreSQL/pgvector e FastAPI.
  6. Skynet Analytics (https://github.com/Jcnok/skynet_analytics) - CRUD RESTful Python.
  `;

    const systemInstruction = `Você é o **Assistente de Currículo ATS do Julio**. NUNCA invente nada fora desse perfil:
${JULIO_PROFILE}

### OBRIGATÓRIO (FORMATO DE SAÍDA)
Sua resposta DEVE conter EXATAMENTE estas três seções separadas por MARCADORES EXATOS. NÃO inclua nenhum texto antes do primeiro marcador.
Os nomes dos projetos selecionados para o currículo devem OBRIGATORIAMENTE incluir os links ao lado.
Os contatos (LinkedIn/GitHub) devem OBRIGATORIAMENTE aparecer no cabeçalho do Currículo com os links fornecidos.

---RELATORIO---
(Seu Relatório de Compatibilidade aqui. Formate os títulos em Markdown #, ##, etc)

---CURRICULO---
(O Currículo personalizado ATS-friendly aqui. Inclua links nos projetos, no Github e no LinkedIn em formato Markdown: [Nome](URL))

---CARTA---
(Sua Carta de Apresentação aqui. Formate em Markdown)`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ role: 'user', parts: [{ text: `VAGA: \n${jobDescription}` }] }],
                    generationConfig: { temperature: 0 },
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini Error: ", data);
            return res.status(502).json({ error: "IA indisponível. Tente novamente." });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '---RELATORIO---\nErro ao gerar análise.';
        res.status(200).json({ reply });
    } catch (error) {
        console.error(error);
        res.status(502).json({ error: 'Timeout de IA.' });
    }
}

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
NOME: JULIO CESAR OKUDA
ENDEREÇO: R. Gal Édson Figueiredo, São Paulo, SP, 04468-100
EMAIL: julio.okuda@gmail.com
TELEFONE: 11981260242
LINKEDIN: https://www.linkedin.com/in/juliookuda/
GITHUB: https://github.com/Jcnok

RESUMO PROFISSIONAL:
Especialista em automação de processos e integração de sistemas com experiência em desenvolvimento de soluções escaláveis. Apaixonado por otimizar fluxos de trabalho, integrar APIs e criar automações robustas. Proficiente em Python, REST APIs, bancos de dados e boas práticas de desenvolvimento. Certificado em Azure (AI Engineer), com foco em transformação digital e soluções inovadoras.

HABILIDADES TÉCNICAS:
- Automação de processos com workflows e integrações
- Desenvolvimento de integrações REST API
- Python, SQL e bancos de dados
- Cloud Computing (Azure)
- Análise de dados e otimização de processos

EXPERIÊNCIA PROFISSIONAL:
- ANALISTA DE SUPORTE PLENO NA CDF (09/06/2016 – 01/04/2021)
Na CDF, atuei como analista de suporte técnico por acesso remoto e via telefone. Como analista pleno, fiz parte de uma equipe de atendimento VIP. Como backup de líder, auxiliei os analistas novos e participei da equipe de testes de implantação de novos produtos. Reuniões com clientes (ex: VIVO) para resolver problemas críticos na implantação de serviços digitais.
- ANALISTA DE BACKOFFICE NA TELEPERFORMANCE (01/06/2015 – 06/06/2016)
Atuei como analista de BackOffice UOL Host, resolvendo problemas de produtos digitais (domínio, hospedagem, loja virtual, BD). Auxiliei no suporte técnico e identifiquei melhorias com supervisores, desenvolvendo comunicação e liderança.

EDUCAÇÃO (TODOS SÃO CONCLUÍDOS):
- MBA em Projetos de Cloud Computing – Descomplica (2021 – 2022)
- MBA em Matemática Financeira e Estatística - Descomplica (2021 - 2022)
- MBA em DATA SCIENCE - Universidade Nove de Julho (UNINOVE) (2020 - 2021)
- TECNÓLOGO EM REDES DE COMPUTADORES – UNINOVE (2016 – 2019)

CERTIFICAÇÕES:
- Azure AI Engineer Associate | Microsoft | 2024
- AWS Cloud Quest: Cloud Practitioner | AWS| 2023
- Azure AI Fundamentals | Microsoft | 2022
- Azure Data Fundamentals | Microsoft | 2022

IDIOMAS:
Inglês Básico | Espanhol Intermediário

PROJETOS RELEVANTES NO GITHUB:
Use EXATAMENTE estes títulos e descrições com a URL em markdown quando recomendá-los:
- [Desafio Langflow](https://github.com/Jcnok/Desafio-Langflow): Plataforma de atendimento inteligente que substitui menus rígidos por roteamento semântico avançado com Docker/OpenAI.
- [Crm System](https://github.com/Jcnok/crm-system): Pipeline de dados dbt + Streamlit + LangChain (Gemini) para SQL e KPIs.
- [Microsoft Hackathon ROI Calculator](https://github.com/Jcnok/MicrosoftInnovationChallange25--ROI-Calculator): Análise preditiva para avaliação de ROI com Azure OpenAI.
- [Stack Labs Churn](https://github.com/Jcnok/Stack_Labs_Churn): Modelo preditivo ML para retenção de clientes (Scikit-learn, Pandas).
- [CRM Skynet Provider](https://github.com/Jcnok/CRM-Skynet-Provider-SQLite_FastAPI): Sistema CRM RESTful via FastAPI e persistência em SQLite.
- [Central Atendimento Azure](https://github.com/Jcnok/central-atendimento-azure): Orquestrador de atendimento com RAG, PostgreSQL (pgvector) e Azure-OpenAI.
`;

    const systemInstruction = `Você é o **Assistente de Currículo ATS do Julio**. NUNCA invente nada fora desse perfil ABSOLUTAMENTE RESTRITO ABAIXO:
${JULIO_PROFILE}

### REGRAS CRÍTICAS (ZERO-SHOT HALLUCINATION TOLERANCE)
- NUNCA liste "Em andamento" para a educação de Julio. TODOS OS CURSOS ESTÃO CONCLUÍDOS.
- NUNCA invente universidades ou locais. Copie estritamente os nomes da base de dados de Julio fornecida (ex: UNINOVE, Descomplica).
- É OBRIGATÓRIO incluir as URLs reais (usando hiperlink Markdown) aos projetos quando forem selecionados. Use os do Perfil de Julio!
- É OBRIGATÓRIO incluir dados de CONTATO REAIS (Endereço, Telefone, Email, Github, LinkedIn) no cabeçalho do Currículo baseados nos do Julio acima.
- O formato de saída NÃO PODE conter títulos grandes como "# Currículo" ou "# Carta de Apresentação" caso esses atrapalhem. Eu usarei tags div.

### OBRIGATÓRIO (FORMATO EXATO DE SAÍDA)
Sua resposta DEVE conter EXATAMENTE estas três seções separadas pelos marcadores EXATOS.
NÃO COMECE O TEXTO DEPOIS DO MARCADOR COM A MESMA PALAVRA DO MARCADOR COMO TÍTULO! Comece direto pelo conteúdo que importa.

---RELATORIO---
(Relatório de compatibilidade, focando em % da VAGA, Forças e Lacunas reais baseadas no perfil real. Não use "# Relatório", vá direto ao primeiro H2 "Compatibilidade:")

---CURRICULO---
(Currículo profissional. Inclua CONTATOS NO TOPO com Markdown H1 para o nome. Cite no máx. 3 Projetos Relevantes. Tudo Baseado NA VERDADE).

---CARTA---
(Texto da carta limpo e em parágrafos. Não crie um título "## Carta de Apresentação", comece direto com "Prezada equipe..." ou algo direcionado à vaga).`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ role: 'user', parts: [{ text: `VAGA: \n${jobDescription}` }] }],
                    generationConfig: { temperature: 0 }, // Temperatura 0 para forçar restrita aderência sem alucinações criativas nos fatos
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini Error: ", data);
            return res.status(502).json({ error: "IA indisponível. Falha na segurança da IA ou erro de quota." });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '---RELATORIO---\nErro estrutural na resposta da IA. Nenhuma ação extraída.';
        res.status(200).json({ reply });
    } catch (error) {
        console.error(error);
        res.status(502).json({ error: 'Timeout ou erro de conexão de Vercel para IA.' });
    }
}

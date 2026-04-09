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
Atendimento VIP. Backup de líder, orientou novos analistas e da equipe de testes implantação produtos. Reuniões VIVO para falhas de implantação de serviços digitais.
- ANALISTA DE BACKOFFICE NA TELEPERFORMANCE (01/06/2015 – 06/06/2016)
BackOffice UOL Host, resolvendo problemas de produtos (domínio, VPS, Banco de dados, etc). Identificou melhorias em conjunto c/ supervisores.

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

IDIOMAS: Básico: Inglês | Intermediário: Espanhol

PROJETOS RELEVANTES NO GITHUB (USE EXATOS LINKS):
- [Desafio Langflow](https://github.com/Jcnok/Desafio-Langflow): Atendimento semântico Docker/OpenAI.
- [Crm System](https://github.com/Jcnok/crm-system): dbt + Streamlit + LangChain.
- [MS Hackathon ROI Calculator](https://github.com/Jcnok/MicrosoftInnovationChallange25--ROI-Calculator): Preditiva c/ Azure OpenAI.
- [Stack Labs Churn](https://github.com/Jcnok/Stack_Labs_Churn): ML Scikit-learn churn.
- [CRM Skynet Provider](https://github.com/Jcnok/CRM-Skynet-Provider-SQLite_FastAPI): SQLite FastAPI.
- [Central Atendimento Azure](https://github.com/Jcnok/central-atendimento-azure): RAG pgvector Azure-OpenAI.
`;

    const systemInstruction = `Você é o **Assistente de Currículo ATS do Julio**. NUNCA invente nada fora desse perfil ABSOLUTAMENTE RESTRITO ABAIXO:
${JULIO_PROFILE}

### REGRAS CRÍTICAS (ZERO-SHOT HALLUCINATION TOLERANCE)
- NUNCA liste "Em andamento" para educação. TODOS CONCLUÍDOS.
- NUNCA invente universidades.
- OBRIGATÓRIO incluir URLs reais markdown.
- OBRIGATÓRIO contatos REAIS (Endereço, Tel, Email, Github, LinkedIn) topo Currículo.
- NÃO CRIE # Títulos Grandes "Relatório", "Carta", pois quebra meu parsing.

### OBRIGATÓRIO (FORMATO EXATO DE SAÍDA - SEÇÃO)
Forneça as 3 EXATAMENTE separadas. O texto APÓS O MARCADOR não deve repetir o marcador como H1. Comece direto.

---RELATORIO---
(Análise compatibilidade, 70% orig / 30% desj. Pontos reais)

---CURRICULO---
(Markdown profissional focado na Vaga)

---CARTA---
(Texto email limpo direcionado a empresa)`;

    const callGemini = async (modelName) => {
        return fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
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
    };

    try {
        // 1º Tentativa: Gemini 2.5 Flash (Superior, menor Rate Limit)
        let response = await callGemini('gemini-2.5-flash');
        let data = await response.json();

        // Fallback Redundante: Se falhar limite ou cota (429 / 5xx)
        if (!response.ok) {
            console.warn("⚠️ Fallback ativado: Gemini 2.5 Flash falhou (Limite excedido ou indisponível). Mudando para 3.1 Flash Lite.");
            response = await callGemini('gemini-3.1-flash-lite-preview');
            data = await response.json();
        }

        // Se a 2º tentativa falhar
        if (!response.ok) {
            console.error("Gemini Multi-Model Exhaustion: Ambos os modelos limitados.", data);

            const humanizedErrorFallback = `---RELATORIO---
<div style="background-color: var(--card-bg); border-left: 4px solid var(--danger-color, #f44336); padding: 15px; border-radius: 4px;">
  <h3 style="color:var(--danger-color, #f44336); margin-top: 0;"><i class="fas fa-exclamation-triangle"></i> Oops! Minhas IAs estão sobrecarregadas</h3>
  <p>Olá! Quero agradecer imensamente o seu interesse. Sinto informá-lo que, neste exato momento, o meu "Agente de Integração" esgotou a cota técnica de limites simultâneos nas duas arquiteturas que utilizo (Gemini 2.5 e 3.1 Lite).</p>
  <p>Não se preocupe! Isso não impede a nossa conexão. Você sempre pode acessar meu fluxo usual:</p>
  <ul style="margin-left: 20px; line-height: 1.8;">
    <li>Enviar-me um e-mail em <a href="mailto:julio.okuda@gmail.com" style="color:var(--accent-primary)">julio.okuda@gmail.com</a></li>
    <li>Conectar-se via <a href="https://linkedin.com/in/juliookuda" target="_blank" style="color:var(--accent-primary)">LinkedIn</a></li>
    <li>Conferir meus projetos completos no <a href="https://github.com/Jcnok" target="_blank" style="color:var(--accent-primary)">GitHub</a></li>
  </ul>
  <p>Ficarei muito feliz em lhe enviar pessoalmente o currículo direcionado à sua análise!</p>
</div>
---CURRICULO---
*Currículo indisponível no momento devido ao Rate Limit. Por favor, solicite via Email/LinkedIn.*
---CARTA---
*Carta indisponível no momento devido ao Rate Limit. Por favor, contate-me diretamente.*`;

            return res.status(200).json({ reply: humanizedErrorFallback });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '---RELATORIO---\nErro no parser do modelo. Tente novamente.';
        res.status(200).json({ reply });

    } catch (error) {
        console.error('Erro de Fetch em rede / Timeout:', error);
        res.status(502).json({ error: 'Timeout de Conexão na Pipeline das IAs.' });
    }
}

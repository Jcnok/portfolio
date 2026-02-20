export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
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
                
                User question: ${message}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API Error');
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Desculpe, não consegui processar sua resposta.';
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to fetch response' });
  }
}

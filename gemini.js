export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Extraire le contenu du format Anthropic
  const { messages, system } = req.body;
  const userMessage = messages[messages.length - 1].content;
  const fullPrompt = system ? `${system}\n\n${userMessage}` : userMessage;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: 1000 }
      })
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';

  // Retourner dans le format Anthropic pour ne pas changer le frontend
  res.status(200).json({
    content: [{ type: 'text', text }]
  });
}

module.exports = async (req, res) => {
  // CORS Headers Setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not set. Please set it in Vercel." });
    }

    const { message, history, systemPrompt } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }
    
    const activeSystemPrompt = systemPrompt || `You are Crop Buddy, a friendly agricultural AI advisor. 
You help Indian farmers solve crop problems, identify pests, and manage plant diseases.
Respond clearly, politely, and keep your answers practical and concise.
You MUST support bilingual communication in both Gujarati and English. If the user asks in Gujarati, respond in Gujarati.
If you suggest chemicals or treatments, try to refer to organic remedies or common chemical products like Carbendazim, Copper Oxychloride, Monocrotophos, etc.
If the query is unrelated to farming or crops, politely guide the user back to crop questions.`;

    const contents = [];
    
    // Add system instruction inside content context
    contents.push({
      role: 'user',
      parts: [{ text: `System Instruction: ${activeSystemPrompt}` }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: "Understood. I will act as a helpful Gujarati and English agricultural expert and advisor." }]
    });

    // Populate conversation history
    if (history && history.length > 0) {
      history.forEach(item => {
        contents.push({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.text }]
        });
      });
    }

    // Append user's new question
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Call Google Gemini 1.5 Flash API REST endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Gemini API error: ${errText}` });
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      return res.status(500).json({ error: "Empty response from AI engine." });
    }

    const reply = data.candidates[0].content.parts[0].text;
    
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Vercel Chat Serverless function error:", error);
    return res.status(500).json({ error: error.message });
  }
};

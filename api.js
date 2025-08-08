// server.js
require('dotenv').config(); // Load .env in development
const express = require('express');

const app = express();
app.use(express.json());

// Hugging Face Chat Completion
async function queryLlama(prompt) {
  const response = await fetch(
    "https://router.huggingface.co/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.1", // No approval needed
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100
      })
    }
  );
  
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return await response.json();
}

// API Endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const result = await queryLlama(message);
    res.json({
      reply: result.choices[0].message.content
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

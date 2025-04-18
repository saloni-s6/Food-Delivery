import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const router = express.Router();

// Load Gemini API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/gemini/chat
router.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Define custom app-specific prompt
    const customPrompt = `
You are an AI support assistant for a food delivery app called "Tomato".
Only respond to queries about Tomato, such as:
- Orders (delayed, missing, incorrect)
- Payments or billing issues
- How to use the app
- Tracking deliveries
- Menu and recommendations

If someone asks anything outside this context (like Amazon or flights), kindly respond:
"I'm here to assist you only with Tomato-related issues 😊."

User: ${userMessage}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro"  });
    const result = await model.generateContent(customPrompt);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply });
  } catch (err) {
    console.error('Gemini API Error:', err.message);
    res.status(500).json({ error: 'Failed to get reply from Gemini' });
  }
});

export default router;

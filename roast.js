import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI client (API key comes from environment variable)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ Health check
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// 🔥 Roast endpoint
app.post("/roast", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are a witty, sarcastic roast bot. Be funny, short, and avoid repeating insults."
      },
      ...history,
      {
        role: "user",
        content: message
      }
    ];

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo", // ✅ guaranteed to work
      messages,
      temperature: 0.9,
      max_tokens: 100
    });

    const roast = response.choices[0].message.content;

    res.json({ roast });
  } catch (err) {
    console.error("OPENAI ERROR:", err.message || err);
    res.status(500).json({
      error: err.message || "AI failed"
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🔥 Roast server running on port ${PORT}`);
});

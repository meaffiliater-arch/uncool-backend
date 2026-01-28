import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/roast", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.json({ roast: "Say something first." });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY missing at runtime");
      return res.status(500).json({ error: "AI failed" });
    }

    // ✅ EXPLICIT KEY PASS — THIS IS THE FIX
    const openai = new OpenAI({
      apiKey,
    });

    const messages = [
      {
        role: "system",
        content:
          "You are a witty, sarcastic roast bot. Never repeat insults. Be concise.",
      },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.9,
      max_tokens: 120,
    });

    res.json({
      roast: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("OPENAI CALL FAILED:", err);
    res.status(500).json({ error: "AI failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔥 Roast server running on port ${PORT}`);
});

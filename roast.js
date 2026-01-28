import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("OpenAI timeout")), ms)
    ),
  ]);
}

app.post("/roast", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message missing" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY missing");
      return res.status(500).json({ error: "AI failed" });
    }

    const openai = new OpenAI({ apiKey });

    const messages = [
      {
        role: "system",
        content:
          "You are a witty, sarcastic roast bot. Never repeat insults. Max 2 sentences.",
      },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message },
    ];

    const completion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.8,
        max_tokens: 80,
      }),
      15000 // ⏱ HARD 15s LIMIT
    );

    const roast = completion?.choices?.[0]?.message?.content;

    if (!roast) {
      return res.status(500).json({ error: "AI failed" });
    }

    return res.json({ roast });
  } catch (err) {
    console.error("🔥 ROAST ERROR:", err.message);
    return res.status(500).json({ error: "AI failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔥 Roast server running on port ${PORT}`);
});

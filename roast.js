import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/roast", async (req, res) => {
  const { item, amount, difficulty, turn, userReply } = req.body;

  const tone =
    difficulty === "soft"
      ? "playful, teasing, not mean"
      : difficulty === "nuclear"
      ? "brutal, savage, sarcastic, ruthless"
      : "witty, sarcastic, confident";

  const systemPrompt = `
You are a savage roast bot in a mobile app called "Uncool".
You roast users for their spending habits.
Tone: ${tone}.
Rules:
- 1–2 sentences max
- Funny, modern, Gen‑Z tone
- No profanity
- No hate or slurs
- Always roast the purchase decision
`;

  const userPrompt = `
User bought "${item}" for ₹${amount}.
This is roast round ${turn}.
User just said: "${userReply}"
Roast them.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: difficulty === "nuclear" ? 0.9 : 0.7,
      max_tokens: 60,
    });

    res.json({
      roast: completion.choices[0].message.content.trim(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
});

app.listen(3001, () =>
  console.log("🔥 Roast server running on port 3001")
);

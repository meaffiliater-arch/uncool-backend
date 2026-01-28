import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

app.post("/roast", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a savage but funny roast bot."
        },
        ...(history || []),
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.9
    });

    const reply = completion.choices[0].message.content;
    res.json({ roast: reply });

  } catch (err) {
    console.error("Roast error:", err);
    res.status(500).json({ error: "AI failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🔥 Roast server running on port ${PORT}`);
});

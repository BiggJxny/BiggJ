// Basic backend setup
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// When user sends a message:
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  // 1. Send message to GPT
  const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer YOUR_OPENAI_API_KEY`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }]
    })
  });
  const gptData = await gptResponse.json();
  const reply = gptData.choices[0].message.content;

  // 2. Convert GPT reply to voice
  const voiceResponse = await fetch("https://api.elevenlabs.io/v1/text-to-speech/YOUR_VOICE_ID/stream", {
    method: "POST",
    headers: {
      "xi-api-key": "YOUR_ELEVENLABS_API_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: reply })
  });

  // 3. Send back both voice and text
  const audioBuffer = await voiceResponse.arrayBuffer();
  res.json({
    text: reply,
    audio: Buffer.from(audioBuffer).toString("base64")
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

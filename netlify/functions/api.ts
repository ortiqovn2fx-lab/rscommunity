import express from "express";
import serverless from "serverless-http";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Роут для суммаризации
app.post("/api/summarize", async (req, res) => {
  try {
    const { content } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // используем стабильную версию
      contents: `Summarize the following article in 3 clear, concise bullet points: \n\n ${content}`,
    });
    res.json({ summary: response.text });
  } catch (err) {
    res.status(500).json({ error: "Failed to summarize" });
  }
});

// Роут для улучшения контента
app.post("/api/enhance", async (req, res) => {
  try {
    const { title, content } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Title: "${title}". Content: "${content}". Task: Polish transcript and provide strategic conclusion in JSON.`,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (err) {
    res.status(500).json({ error: "Failed to enhance" });
  }
});

export const handler = serverless(app);
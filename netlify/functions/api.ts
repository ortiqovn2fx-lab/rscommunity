// netlify/functions/api.ts
const serverless = require("serverless-http");
const express = require("express");

const app = express();

// Middleware для обработки JSON
app.use(express.json());

// Пример маршрута для вашего API
app.get("/api/hello", (req: any, res: any) => {
  res.json({ message: "API is working!" });
});

// Добавьте здесь остальные ваши маршруты...

// Экспортируем как handler для Netlify
exports.handler = serverless(app);
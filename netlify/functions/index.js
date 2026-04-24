const serverless = require("serverless-http");
const express = require("express");
const app = express();

// Разрешаем запросы с вашего сайта
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Или ваш домен
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "API is working!" });
});

module.exports.handler = serverless(app);
app.get("/api/hello", (req, res) => {
  res.json({ message: "API is working!" });
});

module.exports.handler = serverless(app);

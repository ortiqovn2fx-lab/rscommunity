const serverless = require("serverless-http");
const express = require("express");

const app = express();

app.get("/api/hello", (req, res) => {
  res.json({ message: "API is working!" });
});

exports.handler = serverless(app);
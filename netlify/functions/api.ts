const serverless = require("serverless-http");
const express = require("express");

const app = express();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from API!" });
});

module.exports.handler = serverless(app);
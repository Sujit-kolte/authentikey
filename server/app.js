const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { getConfig } = require("./config");
const routes = require("./routes");
const { errorHandler } = require("./middleware");
const app = express(),
  config = getConfig();
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigin === "*" ? true : config.clientOrigin,
    credentials: config.clientOrigin !== "*",
  }),
);
app.use(express.json({ limit: "1mb" }));
app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "authentikey-gateway" }),
);
app.use("/api/v1", routes);
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);
module.exports = app;

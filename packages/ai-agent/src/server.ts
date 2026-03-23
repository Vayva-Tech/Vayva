/**
 * VAYVA AI AGENT - HTTP SERVER
 * Production server for ML-enhanced AI Agent
 * Runs alongside Evolution API on VPS
 */

import { createServer, IncomingMessage, ServerResponse } from "http";
import { logger } from "./lib/logger";
import { MLInferenceClient } from "./lib/ml/ml-client";
import { isMLAvailable, getMLFeatures } from "./lib/ai/providers";

const PORT = process.env.PORT || 3000;
const mlClient = new MLInferenceClient();

// Health check response
interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
  ml: {
    available: boolean;
    features: Record<string, boolean>;
  };
  uptime: number;
}

// Request handler
async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const path = url.pathname;

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    switch (path) {
      case "/health":
        await handleHealth(req, res);
        break;

      case "/ml/sentiment":
        await handleSentiment(req, res);
        break;

      case "/ml/intent":
        await handleIntent(req, res);
        break;

      case "/ml/forecast":
        await handleForecast(req, res);
        break;

      case "/ml/anomalies":
        await handleAnomalies(req, res);
        break;

      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
    }
  } catch (error) {
    logger.error("[Server] Request handler error", { error, path });
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

// Health check endpoint
async function handleHealth(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const status: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.0.0",
    ml: {
      available: isMLAvailable(),
      features: getMLFeatures(),
    },
    uptime: process.uptime(),
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(status, null, 2));
}

// Sentiment analysis endpoint
async function handleSentiment(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const body = await readBody(req);
  const { text } = JSON.parse(body);

  if (!text || typeof text !== "string") {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing or invalid 'text' field" }));
    return;
  }

  const result = await mlClient.analyzeSentiment(text);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ result }));
}

// Intent classification endpoint
async function handleIntent(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const body = await readBody(req);
  const { message } = JSON.parse(body);

  if (!message || typeof message !== "string") {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing or invalid 'message' field" }));
    return;
  }

  const result = await mlClient.classifyIntent(message);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ result }));
}

// Sales forecast endpoint
async function handleForecast(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const body = await readBody(req);
  const { historicalData, days = 7 } = JSON.parse(body);

  if (!Array.isArray(historicalData)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing or invalid 'historicalData' field" }));
    return;
  }

  const result = await mlClient.predictSales(historicalData, days);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ result }));
}

// Anomaly detection endpoint
async function handleAnomalies(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const body = await readBody(req);
  const { data, threshold = 2 } = JSON.parse(body);

  if (!Array.isArray(data)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing or invalid 'data' field" }));
    return;
  }

  const result = await mlClient.detectAnomalies(data, threshold);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ result }));
}

// Helper to read request body
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      resolve(body);
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
}

// Start server
const server = createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    logger.error("[Server] Unhandled error", { error });
    res.writeHead(500);
    res.end("Internal Server Error");
  });
});

server.listen(PORT, () => {
  logger.info(`[Server] AI Agent with ML capabilities running on port ${PORT}`);
  logger.info(`[Server] ML Features: ${Object.entries(getMLFeatures())
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", ")}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("[Server] SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("[Server] Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("[Server] SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("[Server] Server closed");
    process.exit(0);
  });
});

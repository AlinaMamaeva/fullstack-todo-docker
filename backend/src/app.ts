import "dotenv/config";

import express from "express";
import cors from "cors";
import http from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";

import connectDB from "./config/database.js";
import todoRoutes from "./routes/todos.js";
import errorHandler from "./middleware/errorHandler.js";
import setupSocket from "./socket/index.js";

import os from "node:os";
import redisClient, { connectRedis } from "./config/redis.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import uploadsRouter from "./routes/uploads.js";
import client from "prom-client";

const app = express();
app.set("trust proxy", 1);

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// HTTP server
const server = http.createServer(app);

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost")
  .split(",")
  .map((origin) => origin.trim());
// Connect Socket.IO

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Socket.IO events
setupSocket(io);
app.set("io", io);

app.use(helmet());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

app.use((req, res, next) => {
  if (req.path === "/metrics") {
    return next();
  }

  res.on("finish", () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path ?? "unknown",
      status_code: res.statusCode,
    });
  });

  next();
});

app.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch {
    res.status(500).end("Failed to collect metrics");
  }
});

app.use("/uploads", express.static("uploads"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);
app.use("/api", uploadsRouter);

app.get("/health", (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  const redisConnected = redisClient.isReady;

  const healthy = mongoConnected && redisConnected;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "error",
    database: mongoConnected ? "connected" : "disconnected",
    redis: redisConnected ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    containerId: os.hostname(),
  });
});

app.use("/api", todoRoutes);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await connectDB();
    await connectRedis();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received. Shutting down...`);

  // Stop accepting new connections
  try {
    await new Promise<void>((resolve, reject) => {
      io.close((error?: Error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    console.log("Socket.IO and HTTP server closed");

    // Close Redis
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log("Redis disconnected");
    }

    // Close MongoDB
    await mongoose.disconnect();
    console.log("MongoDB disconnected");

    process.exitCode = 0;
  } catch (error) {
    console.error("Shutdown error:", error);
    process.exitCode = 1;
  }
}

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

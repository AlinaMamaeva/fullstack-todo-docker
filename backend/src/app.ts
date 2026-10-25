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

import { connectRedis } from "./config/redis.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import uploadsRouter from "./routes/uploads.js";

const app = express();
app.set("trust proxy", 1);

// HTTP server
const server = http.createServer(app);

// Connect Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:8081",
      "http://localhost:8082",
    ],
  },
});

// Socket.IO events
setupSocket(io);
app.set("io", io);

app.use(helmet());
app.use(cors());
app.use(express.json());

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
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "error",
    database: connected ? "connected" : "disconnected",
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

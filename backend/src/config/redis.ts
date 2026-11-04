
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis ready");
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

redisClient.on("end", () => {
  console.log("Redis connection closed");
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  console.log("Redis connected");
}

export default redisClient;

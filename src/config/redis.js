import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// -------------------
// Redis client for caching
// -------------------
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_URL, // just the hostname
    port: 16635,
  },
  username: "default",
  password: process.env.REDIS_PASS,
});

redisClient.on("error", err => console.error("❌ Redis Error:", err));
redisClient.on("connect", () => console.log("✅ Redis Connected (Cache)"));

// -------------------
// Connection config for BullMQ
// -------------------
const bullConnection = {
  host: process.env.REDIS_URL,
  port: 16635,
  username: "default",
  password: process.env.REDIS_PASS,
};

export { redisClient, bullConnection };

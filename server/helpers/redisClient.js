import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

redisClient.on("connect", () => console.log("✅ Redis connected successfully"));

redisClient.on("disconnect", () => console.log("⚠️  Redis disconnected"));

// Performance monitoring
let commandCount = 0;
const originalSendCommand = redisClient.sendCommand;
redisClient.sendCommand = function(...args) {
  commandCount++;
  if (commandCount % 1000 === 0) {
    console.log(`📊 Redis: ${commandCount} commands executed`);
  }
  return originalSendCommand.apply(this, args);
};
// Lazy connection to avoid top-level await issues in Jest and during import
// Consumers should call ensureRedisConnected() before performing operations when Redis is required.
let isConnected = false;
export async function ensureRedisConnected() {
  if (!isConnected) {
    try {
      await redisClient.connect();
      isConnected = true;
    } catch (err) {
      // Log and rethrow to allow callers to decide whether to proceed without Redis
      console.warn("⚠️  Failed to connect to Redis:", err?.message || err);
      throw err;
    }
  }
}

export default redisClient;

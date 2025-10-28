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

await redisClient.connect();

export default redisClient;

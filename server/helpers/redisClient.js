import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379", // radis port
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

redisClient.on("connect", () => console.log("Redis connected successfully"));

await redisClient.connect();

export default redisClient;

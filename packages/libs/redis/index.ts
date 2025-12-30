import Redis from "ioredis";

const redis = new Redis({
    host: process.env.REDIS_URL || "redis://localhost:6379",
    password: process.env.REDIS_PASSWORD,
    port: Number(process.env.REDIS_PORT) || 6379
});

export default redis;
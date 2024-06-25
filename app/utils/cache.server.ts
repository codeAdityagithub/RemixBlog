import invariant from "tiny-invariant";
import { singleton } from "./singleton.server";
import Redis from "ioredis";
invariant(process.env.REDIS_UPSTASH_URL);

const redisCache = singleton("redisCache", () => {
    const redis = new Redis(process.env.REDIS_UPSTASH_URL!, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => (times > 10 ? null : 5000),
    });

    redis.on("error", (err) => {
        console.error("Redis upstash error:", err);
    });

    redis.on("connect", () => {
        console.log("Connected to Redis upstash");
    });

    return redis;
});

export default redisCache;

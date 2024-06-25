import invariant from "tiny-invariant";
import { singleton } from "./singleton.server";
import Redis from "ioredis";
invariant(process.env.REDIS_RENDER_URL);

const ratelimitCache = singleton("ratelimitCache", () => {
    const redis = new Redis(process.env.REDIS_RENDER_URL!, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => (times > 10 ? null : 5000),
    });

    redis.on("error", (err) => {
        console.error("Redis render error:", err);
        redis.disconnect();
    });

    redis.on("connect", () => {
        console.log("Connected to Redis render");
    });

    return redis;
});

export default ratelimitCache;

import invariant from "tiny-invariant";
import { singleton } from "./singleton.server";
import Redis from "ioredis";
invariant(process.env.REDIS_RENDER_URL);

const ratelimitCache = singleton("ratelimitCache", () => {
    const redis = new Redis(process.env.REDIS_RENDER_URL!);

    redis.on("error", (err) => {
        console.error("Redis render error:", err);
    });

    redis.on("connect", () => {
        console.log("Connected to Redis render");
    });

    return redis;
});

export default ratelimitCache;

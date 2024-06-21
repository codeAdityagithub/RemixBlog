import ratelimitCache from "./rateLimitRedis.server";

export async function ratelimitHeaders(
    endpoint: string,
    headers: Headers,
    duration: number,
    limit: number
) {
    const ip = headers.get("x-forwarded-for") ?? "";
    const key = `ratelimit:${endpoint}:${ip}`;

    return await ratelimitId(endpoint, key, duration, limit);
}
export async function ratelimitId(
    endpoint: string,
    id: string,
    duration: number,
    limit: number
) {
    const key = `ratelimit:${endpoint}:${id}`;

    const requests = await ratelimitCache.incr(key);
    if (requests === 1) {
        await ratelimitCache.expire(key, duration);
    }
    if (requests >= limit) {
        return { left: 0 };
    }
    return { left: limit - requests };
}

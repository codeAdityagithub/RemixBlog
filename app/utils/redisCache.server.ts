import redisCache from "./cache.server";
export async function setCache(key: string, value: any, ttl?: number) {
    try {
        const serialized = JSON.stringify(value);
        if (ttl) {
            await redisCache.set(key, serialized, "EX", ttl);
        } else {
            await redisCache.set(key, serialized);
        }
    } catch (error) {
        console.error("Error setting cache:", error);
    }
}

export async function getCache(key: string) {
    try {
        const value = await redisCache.get(key);
        if (!value) return value;
        return JSON.parse(value);
    } catch (error) {
        console.error("Error getting cache:", error);
        return null;
    }
}

export async function deleteCache(key: string) {
    try {
        await redisCache.del(key);
    } catch (error) {
        console.error("Error deleting cache:", error);
    }
}

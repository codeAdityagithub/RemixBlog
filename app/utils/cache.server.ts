import { singleton } from "./singleton.server";
import { LRUCache } from "lru-cache";
const serverCache = singleton(
    "serverCache",
    () => new LRUCache({ max: 100, ttl: 1000 * 60 * 5 })
);

export default serverCache;

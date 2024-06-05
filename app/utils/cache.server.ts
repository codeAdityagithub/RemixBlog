import { singleton } from "./singleton.server";
import { LRUCache } from "lru-cache";
const serverCache = singleton("serverCache", () => new LRUCache({ max: 500 }));

export default serverCache;

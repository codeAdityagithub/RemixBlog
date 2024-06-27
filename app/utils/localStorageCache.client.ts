import { sortAllBlogs } from "./general";

export function addToCache(key: string, data: any): boolean {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.log("data must be a valid json");
        return false;
    }
}
export function removeFromCache(key: string) {
    localStorage.removeItem(key);
}
export function hasInCache(key: string) {
    return localStorage.getItem(key) !== null;
}
export function getFromCache(key: string) {
    return JSON.parse(localStorage.getItem(key)!);
}

export async function cacheClientLocal({
    cacheKey,
    serverLoader,
}: {
    cacheKey: string;
    serverLoader: any;
}) {
    if (hasInCache(cacheKey)) return getFromCache(cacheKey);
    // console.log("cache miss");
    const data = await serverLoader();
    if (data) addToCache(cacheKey, data);
    // console.log(data);
    return data;
}
export async function cacheDashboardBlogs({ request }: { request: Request }) {
    const cacheKey = "dashboardBlogs";
    const page = parseInt(new URL(request.url).searchParams.get("page") ?? "1");
    const sortBy =
        new URL(request.url).searchParams.get("sortBy") ?? "createdAt";
    const sort = new URL(request.url).searchParams.get("sort") ?? "asc";
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    if (hasInCache(cacheKey)) {
        const blogs = getFromCache(cacheKey).blogs as any[];
        // console.log(blogs.slice(skip, Math.min(pageSize * page, blogs.length)));
        sortAllBlogs(blogs, sortBy, sort);
        return {
            blogs: blogs.slice(skip, Math.min(pageSize * page, blogs.length)),
            totalBlogs: blogs.length,
        };
    }
    // console.log("cache miss");
    const data = await fetch("/api/dashboardBlogs", {
        credentials: "same-origin",
    }).then((res) => res.json());
    if (data && data.blogs?.length > 0) {
        addToCache(cacheKey, data);
        window.dispatchEvent(new Event("localStorageChange"));
    }
    // console.log(data);
    sortAllBlogs(data.blogs, sortBy, sort);

    return {
        blogs: data.blogs.splice(skip, pageSize),
        totalBlogs: data.blogs.length,
    };
}

export async function cachedClientAction({
    cacheKeys,
    serverAction,
}: {
    cacheKeys: string[];
    serverAction: any;
}) {
    cacheKeys.forEach((key) => {
        removeFromCache(key);
    });
    const serverData = await serverAction();
    return serverData;
}

export function clearLocalCache(cacheKeys: [string]) {
    cacheKeys.forEach((key) => {
        removeFromCache(key);
    });
}

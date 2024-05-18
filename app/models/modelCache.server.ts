import { BlogDocument, Blogs } from "./Schema.server";

type cacheType = {
    popularBlogs: BlogDocument[];
    trendingBlogs: BlogDocument[];
    latestBlogs: BlogDocument[];
};
const cache: cacheType = {
    popularBlogs: [],
    trendingBlogs: [], //combination of likes and comments in a giver time period
    latestBlogs: [],
};

async function getPopularBlogs() {
    return await Blogs.find(
        {},
        {},
        { sort: { views: -1 }, limit: 10, lean: true }
    ).populate("author", { username: 1 });
}
async function getTrendingBlogs() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return await Blogs.find(
        {
            createdAt: { $gte: oneWeekAgo },
        },
        {},
        { sort: { views: -1, likes: -1, comments: -1 }, limit: 10, lean: true }
    ).populate("author", { username: 1 });
}
async function getLatestBlogs() {
    return await Blogs.find(
        {},
        {},
        { sort: { createdAt: -1 }, limit: 10, lean: true }
    ).populate("author", { username: 1 });
}

const updateCache = async () => {
    try {
        cache.popularBlogs = await getPopularBlogs();
        cache.trendingBlogs = await getTrendingBlogs();
        cache.latestBlogs = await getLatestBlogs();
        console.log("Cache updated at", new Date());
    } catch (err) {
        console.error("Error updating cache:", err);
    }
};

// Update the cache every hour (3600000 milliseconds)
setInterval(updateCache, 3600000);

// Initial cache population
updateCache();
export default cache;
// console.log(cache.latestBlogs);

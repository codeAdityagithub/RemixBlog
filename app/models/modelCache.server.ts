import { connect } from "~/db.server";
import { BlogDocument, Blogs } from "./Schema.server";
import { getCache, setCache } from "~/utils/redisCache.server";
export interface BlogDocumentwPic extends Omit<BlogDocument, "author"> {
    author: { username: string; picture?: string };
}
export interface cacheBlogsType {
    popularBlogs: BlogDocumentwPic[];
    trendingBlogs: BlogDocumentwPic[];
    latestBlogs: BlogDocumentwPic[];
}
async function getPopularBlogs() {
    return (await Blogs.find({}, { comments: 0, likes: 0, content: 0 })
        .sort({ views: -1 })
        .limit(10)
        .lean()
        .populate("author", { username: 1, picture: 1, _id: 0 })) as any;
}
async function getTrendingBlogs() {
    const oneMAgo = new Date();
    oneMAgo.setDate(oneMAgo.getDate() - 30);

    return (await Blogs.find(
        {
            createdAt: { $gte: oneMAgo },
        },
        { content: 0 }
    )
        .sort({ views: -1, likes: -1, comments: -1 })
        .limit(10)
        .lean()
        .populate("author", { username: 1, picture: 1, _id: 0 })) as any;
}
async function getLatestBlogs() {
    return (await Blogs.find(
        {},
        { comments: 0, likes: 0, content: 0, views: 0 }
    )
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .populate("author", { username: 1, picture: 1, _id: 0 })) as any;
}

const updateCache = async () => {
    try {
        await connect();
        const popularBlogs = await getPopularBlogs();
        const trendingBlogs = await getTrendingBlogs();
        const latestBlogs = await getLatestBlogs();
        setCache("popularBlogs", popularBlogs, 600);
        setCache("trendingBlogs", trendingBlogs, 600);
        setCache("latestBlogs", latestBlogs, 600);
        console.log("Cache updated at", new Date());

        return { popularBlogs, trendingBlogs, latestBlogs } as cacheBlogsType;
    } catch (err) {
        console.error("Error updating cache:", err);
        return {
            popularBlogs: [],
            trendingBlogs: [],
            latestBlogs: [],
        } as cacheBlogsType;
    }
};
export const getBlogs = async () => {
    const popularBlogs = await getCache("popularBlogs");
    const trendingBlogs = await getCache("trendingBlogs");
    const latestBlogs = await getCache("latestBlogs");
    if (!popularBlogs || !trendingBlogs || !latestBlogs) {
        console.log("cache miss");
        return await updateCache();
    }
    console.log("cache hit");
    return { popularBlogs, trendingBlogs, latestBlogs } as cacheBlogsType;
};

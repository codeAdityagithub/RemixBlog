import { Types } from "mongoose";
import { Blogs } from "./Schema.server";

export async function getAnalytics(userId: string): Promise<{
    totalBlogs: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
}> {
    const stats = await Blogs.aggregate([
        // Match blog posts by the author
        { $match: { author: new Types.ObjectId(userId) } },
        // Group by null to get the total sum
        {
            $group: {
                _id: null,
                totalBlogs: { $sum: 1 },

                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$likes" },
                totalComments: { $sum: "$comments" },
            },
        },
    ]);
    if (!stats || !stats[0]) {
        return {
            totalBlogs: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
        };
    }
    const { _id, ...restStats } = stats[0];
    return restStats;
}

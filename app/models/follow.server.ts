import { json } from "@remix-run/node";
import { Follows } from "./Schema.server";
import { Types } from "mongoose";

export async function follow(follower: string, following: string) {
    try {
        if (follower === following) throw new Error("Cannot follow self");
        await Follows.create({ follower, following });
        return json("followed");
    } catch (error: any) {
        console.log(error.message ?? error);
        return json("Cannot follow", { status: 500 });
    }
}
export async function isFollowing(userId: string, following: string) {
    try {
        const doc = await Follows.findOne({ follower: userId, following });
        // console.log(isFollowing);
        if (!doc) return false;

        return "trueT" + new Date(doc.createdAt).getTime();
    } catch (error: any) {
        console.log(error.message ?? error);
        return false;
    }
}

export async function unfollow(follower: string, following: string) {
    try {
        // Delete the follow relationship if created more than 5 minutes ago
        await Follows.deleteOne({
            follower: follower,
            following: following,
        });
        return json("unfollowed");
    } catch (error: any) {
        console.log(error.message ?? error);
        return json("Cannot unfollow", { status: 500 });
    }
}

export async function getFollowStats(userId: Types.ObjectId) {
    const result = await Follows.aggregate([
        {
            $facet: {
                followers: [
                    { $match: { following: userId } },
                    { $count: "count" },
                ],
                following: [
                    { $match: { follower: userId } },
                    { $count: "count" },
                ],
            },
        },
    ]);

    const followersCount = result[0].followers[0]
        ? result[0].followers[0].count
        : 0;
    const followingCount = result[0].following[0]
        ? result[0].following[0].count
        : 0;

    return { followersCount, followingCount };
}

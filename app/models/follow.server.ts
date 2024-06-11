import { json } from "@remix-run/node";
import { Follow } from "./Schema.server";

export async function follow(follower: string, following: string) {
    try {
        await Follow.create({ follower, following });
        return json("followed");
    } catch (error: any) {
        console.log(error.message ?? error);
        return json("Cannot follow", { status: 500 });
    }
}
export async function isFollowing(userId: string, following: string) {
    try {
        const doc = await Follow.findOne({ follower: userId, following });
        // console.log(isFollowing);
        if (!doc) return false;

        return "trueT" + Date.now();
    } catch (error: any) {
        console.log(error.message ?? error);
        return false;
    }
}

export async function unfollow(follower: string, following: string) {
    try {
        // Delete the follow relationship if created more than 5 minutes ago
        await Follow.deleteOne({
            follower: follower,
            following: following,
        });
        return json("Unfollowed");
    } catch (error: any) {
        console.log(error.message ?? error);
        return json("Cannot unfollow", { status: 500 });
    }
}

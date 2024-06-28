import { LoaderFunctionArgs } from "@remix-run/node";
import { Types } from "mongoose";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { getAnalytics } from "~/models/dashboard.server";
import { getFollowStats } from "~/models/follow.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login?redirectTo=/dashboard",
    });
    await connect();
    const analytics = await getAnalytics(user._id);
    const { followersCount, followingCount } = await getFollowStats(
        new Types.ObjectId(user._id)
    );
    // console.log("api call");
    return { analytics, followers: followersCount, following: followingCount };
};

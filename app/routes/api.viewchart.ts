import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { Blogs, Engagements } from "~/models/Schema.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login?redirectTo=/dashboard",
    });
    const blogIds = await Blogs.find({ author: user._id }, { _id: 1 }).lean();
    const blogIdArray = blogIds.map((blog) => blog._id);
    // const views = await Engagements.find(
    //     { blogId: { $in: blogIds } },
    //     { createdAt: 1, _id: 0 }
    // ).lean();
    const views: { date: Date; views: number }[] = await Engagements.aggregate([
        { $match: { blogId: { $in: blogIdArray } } },
        { $group: { _id: "$createdAt", views: { $sum: "$views" } } },
        { $project: { _id: 0, date: "$_id", views: 1 } },
        { $sort: { date: 1 } },
    ]);
    // console.log(views);
    return { views };
};

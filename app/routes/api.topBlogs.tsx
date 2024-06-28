import { LoaderFunctionArgs } from "@remix-run/node";
import { Types } from "mongoose";
import { authenticator } from "~/auth.server";
import { BlogDocument, Blogs } from "~/models/Schema.server";

export type BlogDoc = Pick<
    BlogDocument,
    "desc" | "title" | "likes" | "thumbnail" | "views" | "comments"
> & { _id: string; createdAt: string };

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login?redirectTo=/dashboard",
    });

    const oneMAgo = new Date();
    oneMAgo.setDate(oneMAgo.getDate() - 60); // Setting date to 30 days ago

    const blogs = (await Blogs.aggregate([
        {
            $match: {
                author: new Types.ObjectId(user._id), // Filter for blogs of a specific author
                createdAt: { $gte: oneMAgo }, // Filter for blogs created in the last month
            },
        },
        {
            $addFields: {
                combinedScore: {
                    $add: [
                        { $multiply: [{ $ifNull: ["$views", 0] }, 0.5] },
                        { $multiply: [{ $ifNull: ["$likes", 0] }, 0.3] },
                        { $multiply: [{ $ifNull: ["$comments", 0] }, 0.2] },
                    ],
                },
            },
        },
        {
            $sort: { combinedScore: -1 }, // Sort by views in descending order (as per original query)
        },
        {
            $limit: 15, // Limit to top 15 results (as per original query)
        },
        {
            $project: {
                title: 1,
                createdAt: 1,
                likes: 1,
                views: 1,
                comments: 1,
                thumbnail: 1,
            },
        },
    ]).exec()) as BlogDoc[];
    return { blogs };
};

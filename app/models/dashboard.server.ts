import { Types } from "mongoose";
import { Blogs, Follows } from "./Schema.server";
import { json, redirect } from "@remix-run/node";
import sanitizeHtml from "sanitize-html";
import { ZodError } from "zod";
import { NewBlogSchema } from "~/lib/zod";
import { limitImageTags, parseZodBlogError } from "~/utils/general";
import { ratelimitId } from "~/utils/ratelimit.server";
import { connect } from "~/db.server";

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

export async function parseAndUploadNewBlog(
    request: Request,
    userId: string,
    username: string
) {
    try {
        const { left } = await ratelimitId("createBlog", userId, 300, 1);
        if (left === 0)
            return json({
                error: {
                    message: "You can only upload one blog every 5 minutes.",
                },
            });

        const body = await request.json();
        // const parsed = parseNewBlog(body);
        // console.log(blog.get("content"));
        const newBlog = NewBlogSchema.parse(body);
        newBlog.content = sanitizeHtml(newBlog.content, {
            allowedSchemes: ["http", "https"],
            allowedAttributes: {
                img: ["src", "alt", "width", "height"], // Allow specific attributes for 'img'
            },
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        });
        // console.log(newBlog.content);
        try {
            limitImageTags(newBlog.content);
        } catch (error: any) {
            return json(
                {
                    error: {
                        message: error.message ?? "Something went wrong!",
                    },
                },
                { status: 400 }
            );
        }
        // console.log(newBlog.content);
        await connect();
        const dbblog = await Blogs.create({ ...newBlog, author: userId });
        await sendNotifications(userId, username, dbblog._id.toString());
        // console.log(dbblog);
        return redirect(`/blogs/${dbblog._id.toString()}`);
    } catch (error: any) {
        if (error instanceof ZodError) {
            return json(parseZodBlogError(error), { status: 400 });
        }
        console.log(error);
        return json(
            { error: { message: "Something went wrong!" } },
            { status: 500 }
        );
    }
}

async function sendNotifications(
    authorId: string,
    authorName: string,
    newBlogId: string
) {
    // Send notifications to the author's followers
    await Follows.updateMany(
        { following: authorId },
        {
            $set: {
                notification: `${authorName} has uploaded a new blog.`,
                read: false,
                link: `/blogs/${newBlogId}`,
            },
        }
    );
    // console.log(update);
}

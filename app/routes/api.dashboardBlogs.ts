import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { Blogs } from "~/models/Schema.server";
import { BlogDoc } from "./dashboard.blogs._index";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login?redirectTo=/dashboard/blogs",
    });
    await connect();
    const blogs = (await Blogs.find(
        { author: user._id },
        {
            title: 1,
            createdAt: 1,
            likes: 1,
            views: 1,
            comments: 1,
            thumbnail: 1,
        }
    )
        .sort({ createdAt: -1 })
        .lean()) as BlogDoc[];
    // console.log(blogs[0]._id);
    return { blogs };
};

import { createCookie } from "@remix-run/node";
import { Content } from "~/models/Schema.server";
import { incViews } from "~/models/functions.server";

const viewedBlogCookie = createCookie("viewedBlogs", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600 * 24 * 7,
});

const MAX_VIEWS = 100;

export async function checkUnauthViewed(request: Request, blogId: string) {
    const viewedBlogs: string[] | null = await viewedBlogCookie.parse(
        request.headers.get("Cookie")
    );
    if (!viewedBlogs || viewedBlogs.length === 0) {
        await incViews(blogId);
        return await viewedBlogCookie.serialize([blogId]);
    } else if (!viewedBlogs.includes(blogId)) {
        if (viewedBlogs.length >= MAX_VIEWS) {
            viewedBlogs.shift();
        }
        await incViews(blogId);
        viewedBlogs.push(blogId);
        return await viewedBlogCookie.serialize(viewedBlogs);
    }
    return null;
}

const AVG_READ_SPEED = 200;
export function readMin(content: String) {
    let textlength = content.length / 1000;

    return Math.ceil(textlength);
}

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
export function readMin(content: Content[]) {
    let length = 0,
        textlength =
            content.reduce((count, c) => count + c.content.length, 0) / 1000;

    content.forEach((c) => {
        for (let i = 0; i < c.content.length; i++) {
            // Check if the current character is a whitespace and the previous character is not a whitespace
            if (c.content[i] === " " && (i === 0 || c.content[i - 1] !== " ")) {
                length++;
            }
        }
    });
    return Math.max(Math.ceil(length / AVG_READ_SPEED), Math.ceil(textlength));
}

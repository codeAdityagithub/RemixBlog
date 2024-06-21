import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { ShouldRevalidateFunction } from "@remix-run/react";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { BlogDocument, Blogs } from "~/models/Schema.server";
import { isBlogLikedViewed, likeBlog } from "~/models/functions.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { blogId } = params;
    invariant(blogId, "No blogId specified");
    await connect();
    const user = await authenticator.isAuthenticated(request);
    let liked = false;
    if (user) {
        liked = (await isBlogLikedViewed(blogId, user._id)) ?? false;
    }
    const blog = (await Blogs.findById(blogId, {
        likes: 1,
        comments: 1,
        views: 1,
    }).lean()) as Pick<BlogDocument, "likes" | "views" | "comments" | "_id">;

    if (!blog)
        throw json("Blog Not Found", {
            status: 404,
            statusText: "Requested blog not found",
        });
    // console.log(blog);
    return { ...blog, liked };
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
    const _action = (await request.formData()).get("_action");

    const blogId = params.blogId;
    const { _id: userId } = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    invariant(blogId);
    await connect();
    if (_action === "like") {
        await likeBlog(blogId, userId);
    }
    return { ok: true };
};
export const shouldRevalidate: ShouldRevalidateFunction = ({
    defaultShouldRevalidate,
    formAction,
    formData,
}) => {
    // if (formAction?.split("/").pop() === "comments") return false;
    const action = formData?.get("_action");
    if (
        action === "likeComment" ||
        action === "replyComment" ||
        action === "likeReply" ||
        action === "deleteReply" ||
        action === "tagReply" ||
        formAction === "/api/profile" ||
        formAction === "/api/follow"
    )
        return false;
    return defaultShouldRevalidate;
};

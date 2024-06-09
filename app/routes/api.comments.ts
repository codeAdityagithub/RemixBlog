import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { CommentDocumentwUser, Comments } from "~/models/Schema.server";
import { deleteCommentAdmin } from "~/models/comments.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    const searchParams = new URL(request.url).searchParams;
    const page = parseInt(searchParams.get("page") ?? "1");
    const skip = (page - 1) * 10;
    try {
        await connect();
        const comments: Omit<
            CommentDocumentwUser,
            "likedBy" | "updatedAt" | "parentComment" | "blogOwner"
        >[] = await Comments.find(
            { blogOwner: user._id, parentComment: null },
            { content: 1, likes: 1, user: 1, blogId: 1, createdAt: 1 },
            { $sort: { createdAt: 1 }, limit: 10, skip }
        );
        return { comments };
    } catch (error) {
        return json({ error: "Somthing went wrong" }, { status: 500 });
    }
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const form = await request.formData();
    const { _id: userId } = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });

    try {
        const commentId = String(form.get("commentId"));
        invariant(commentId);
        await connect();
        await deleteCommentAdmin(commentId, userId);
        return { message: "deleted" };
    } catch (error) {
        return { error: "Something went Wrong" };
    }
};

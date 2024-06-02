import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { CommentDocumentwUser, Comments } from "~/models/Schema.server";
import { deleteCommentAdmin } from "~/models/comments.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    try {
        const comments: Omit<
            CommentDocumentwUser,
            "likedBy" | "updatedAt" | "parentComment" | "blogOwner"
        >[] = await Comments.find(
            { blogOwner: user._id, parentComment: null },
            { content: 1, likes: 1, user: 1, blogId: 1, createdAt: 1 }
        )
            .populate("user", { username: 1, picture: 1 })
            .lean();
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
        await deleteCommentAdmin(commentId, userId);
        return { message: "deleted" };
    } catch (error) {
        return { error: "Something went Wrong" };
    }
};

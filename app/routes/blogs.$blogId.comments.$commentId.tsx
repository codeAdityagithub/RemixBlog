import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { Comments } from "~/models/Schema.server";
import { replyCommentToBlog } from "~/models/comments.server";

type Props = {};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    // await Comments.find({blogId:})
    const { commentId } = params;
    invariant(commentId);
    const user = await authenticator.isAuthenticated(request);
    await connect();
    const comments = await Comments.find({ parentComment: commentId })
        .populate("user", {
            username: 1,
        })
        .lean();

    // Check if each comment is liked by the current user
    const commentsWithLiked = comments.map((comment) => {
        const isLiked = comment.likedBy.some(
            (likedUserId) => likedUserId.toString() === user?._id
        );
        const { likedBy, ...commentWithoutLikedBy } = comment;
        return {
            ...commentWithoutLikedBy,
            liked: isLiked,
        };
    });
    // console.log(commentsWithLiked, commentId);

    // console.log("comments fetched with liked status");
    return { replies: commentsWithLiked };
};

// reply action
export const action = async ({ request, params }: ActionFunctionArgs) => {
    const form = await request.formData();
    const { commentId, blogId } = params;
    const { _id: userId } = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    invariant(commentId);
    invariant(blogId);
    try {
        await connect();
        const comment = form.get("comment");
        invariant(comment);
        await replyCommentToBlog(blogId, userId, comment.toString(), commentId);

        return { ok: true };
    } catch (error) {
        return { error: "Something went Wrong" };
    }
};

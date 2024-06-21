import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { Comments, Replies } from "~/models/Schema.server";
import {
    deleteReply,
    likeReply,
    replyCommentToBlog,
    tagReply,
} from "~/models/comments.server";

type Props = {};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    // await Comments.find({blogId:})
    const commentId = new URL(request.url).searchParams.get("parentComment");
    invariant(commentId);
    const user = await authenticator.isAuthenticated(request);
    await connect();
    const replies = await Replies.find({ parentComment: commentId })
        .populate("user", {
            username: 1,
            picture: 1,
        })
        .lean();

    // Check if each comment is liked by the current user
    const repliesWithLiked = replies.map((reply) => {
        const isLiked = reply.likedBy.some(
            (likedUserId) => likedUserId.toString() === user?._id
        );
        const { likedBy, ...replyWithoutLikedBy } = reply;
        return {
            ...replyWithoutLikedBy,
            liked: isLiked,
        };
    });
    // console.log(commentsWithLiked, commentId);

    // console.log("comments fetched with liked status");
    return { replies: repliesWithLiked };
};

// // reply action
// export const action = async ({ request, params }: ActionFunctionArgs) => {
//     const form = await request.formData();
//     const { blogId } = params;
//     const { _id: userId } = await authenticator.isAuthenticated(request, {
//         failureRedirect: "/login",
//     });
//     // invariant(commentId);
//     invariant(blogId);
//     try {
//         await connect();
//         const comment = form.get("comment");
//         invariant(comment);
//         await replyCommentToBlog(blogId, userId, comment.toString(), commentId);

//         return { ok: true };
//     } catch (error) {
//         return { error: "Something went Wrong" };
//     }
// };

// reply action
export const action = async ({ request, params }: ActionFunctionArgs) => {
    const form = await request.formData();
    const { blogId } = params;
    const { _id: userId, username: user_name } =
        await authenticator.isAuthenticated(request, {
            failureRedirect: "/login",
        });
    invariant(blogId);
    await connect();
    try {
        if (form.get("_action") === "likeReply") {
            const replyId = form.get("replyId");
            invariant(replyId);
            await likeReply(replyId.toString(), userId);
            return { message: "liked" };
        } else if (form.get("_action") === "deleteReply") {
            const replyId = form.get("replyId");
            invariant(replyId);
            await deleteReply(replyId.toString(), userId);
            return { message: "deleted" };
        } else if (form.get("_action") === "tagReply") {
            const replyId = String(form.get("replyId"));
            const reply = String(form.get("reply"));
            const parentComment = String(form.get("parentComment"));

            const username = String(form.get("username"));

            invariant(replyId);
            invariant(reply);
            invariant(parentComment);
            if (username === user_name) return { message: "cannot tag self" };
            await tagReply(
                { replyId, username },
                blogId,
                userId,
                reply,
                parentComment
            );
            return { message: "tagged" };
        } else {
            const reply = String(form.get("reply"));
            const parentComment = String(form.get("parentComment"));
            invariant(reply);
            await replyCommentToBlog(blogId, userId, reply, parentComment);
            return { message: "added" };
        }
    } catch (error) {
        console.log(error);
        return { error: "Something went Wrong" };
    }
};

// export const shouldRevalidate: ShouldRevalidateFunction = () => {
//     return false;
// };

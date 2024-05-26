import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import React from "react";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import {
    CommentDocument,
    CommentDocumentwUser,
    Comments,
    Engagements,
} from "~/models/Schema.server";
import { addCommentToBlog, likeComment } from "~/models/comments.server";
import BlogCommentsSheet from "~/mycomponents/BlogCommentsSheet";

type Props = {};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    // await Comments.find({blogId:})
    const { blogId } = params;
    invariant(blogId);
    const user = await authenticator.isAuthenticated(request);
    await connect();
    const comments = await Comments.find({ blogId })
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

    console.log("comments fetched with liked status");
    return { comments: commentsWithLiked };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const form = await request.formData();
    const comment = form.get("comment");
    const { blogId } = params;
    const { _id: userId } = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    invariant(blogId);
    try {
        if (form.get("_action") === "likeComment") {
            const commentId = form.get("commentId");
            invariant(commentId);
            await likeComment(commentId.toString(), userId);
        } else {
            invariant(comment);
            await addCommentToBlog(blogId, userId, comment.toString());
        }
        return { ok: true };
    } catch (error) {
        return { error: "Something went Wrong" };
    }
};
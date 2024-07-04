import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { ShouldRevalidateFunction } from "@remix-run/react";
import { Types } from "mongoose";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { Comments } from "~/models/Schema.server";
import {
  addCommentToBlog,
  deleteComment,
  likeComment,
} from "~/models/comments.server";
import { ratelimitId } from "~/utils/ratelimit.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // await Comments.find({blogId:})
  const { blogId } = params;
  invariant(blogId);
  const user = await authenticator.isAuthenticated(request);
  const pageSize = 10;
  const cursor = new URL(request.url).searchParams.get("cursor");
  const sortBy = new URL(request.url).searchParams.get("sortBy") || "likes"; // "likes" or "createdAt"

  await connect();

  const commentsQuery = Comments.find({ blogId });

  if (sortBy === "likes") {
    commentsQuery.sort({ likes: -1, _id: -1 }); // Sort by likes descending, then by _id descending
  } else if (sortBy === "createdAt") {
    commentsQuery.sort({ _id: -1 }); // Sort by _id descending which aligns with createdAt as well
  }

  // Apply cursor-based pagination logic
  if (cursor && cursor !== "" && cursor !== "null") {
    const [cursorLikes, cursorId] = cursor.split(",");

    if (sortBy === "likes") {
      commentsQuery.where({
        $or: [
          { likes: { $lt: Number(cursorLikes) } },
          {
            likes: Number(cursorLikes),
            _id: { $lt: new Types.ObjectId(cursorId) },
          },
        ],
      });
    } else if (sortBy === "createdAt") {
      commentsQuery.where({
        _id: { $lt: new Types.ObjectId(cursorId) },
      });
    }
  }

  const comments = await commentsQuery
    .limit(pageSize)
    .populate("user", { username: 1, picture: 1 })
    .lean();
  // console.log(sortBy, cursor);
  // Extract the new cursor from the last document
  const newCursor =
    comments.length > 0
      ? `${comments[comments.length - 1].likes},${comments[
          comments.length - 1
        ]._id.toString()}`
      : null;

  // Check if there are more comments to load
  const hasMore = comments.length === pageSize;

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
  // console.log(sortBy);
  return { comments: commentsWithLiked, cursor: newCursor, hasMore };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData();
  const { blogId } = params;
  const {
    _id: userId,
    username,
    picture,
  } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(blogId);
  try {
    await connect();
    if (form.get("_action") === "likeComment") {
      const commentId = form.get("commentId");
      invariant(commentId);
      await likeComment(commentId.toString(), userId);
      return { message: "liked", commentId };
    } else if (form.get("_action") === "deleteComment") {
      const commentId = form.get("commentId");
      invariant(commentId);
      await deleteComment(commentId.toString(), userId);
      return { message: "deleted", commentId };
    } else {
      const comment = form.get("comment");
      invariant(comment);
      const { left } = await ratelimitId("commentAdd", userId, 60, 3);
      // console.log(left);
      if (left === 0)
        return json(
          { message: "You can only add 3 comments per minute" },
          { status: 429 }
        );
      // @ts-expect-error
      const { __v, likedBy, ...addedComment } = await addCommentToBlog(
        blogId,
        userId,
        comment.toString(),
        username,
        picture
      );
      return { message: "added", comment: addedComment };
    }
  } catch (error) {
    return { error: "Something went Wrong" };
  }
};

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

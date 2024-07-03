import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
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
import { ratelimitId } from "~/utils/ratelimit.server";

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

// reply action
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData();
  const { blogId } = params;
  const {
    _id: userId,
    username: user_name,
    picture,
  } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(blogId);
  await connect();
  try {
    if (form.get("_action") === "likeReply") {
      const replyId = form.get("replyId");
      invariant(replyId);
      await likeReply(replyId.toString(), userId);
      return { message: "liked", replyId };
    } else if (form.get("_action") === "deleteReply") {
      const replyId = form.get("replyId");
      invariant(replyId);
      await deleteReply(replyId.toString(), userId);
      return { message: "deleted", replyId };
    } else if (form.get("_action") === "tagReply") {
      const { left } = await ratelimitId("tagReply", userId, 60, 3);
      // console.log(left);
      if (left === 0)
        return json(
          { message: "You can only add 3 replies per minute" },
          { status: 429 }
        );
      const replyId = String(form.get("replyId"));
      const reply = String(form.get("reply"));
      const replyUser = String(form.get("replyUser"));
      const parentComment = String(form.get("parentComment"));

      const username = String(form.get("username"));

      invariant(replyId);
      invariant(reply);
      invariant(replyUser);
      invariant(parentComment);
      if (username === user_name) return { message: "cannot tag self" };
      const doc = await tagReply(
        { replyId, username },
        blogId,
        userId,
        reply,
        parentComment,
        replyUser,
        user_name,
        picture
      );
      return { message: "tagged", reply: doc?.reply };
    } else {
      const { left } = await ratelimitId("reply", userId, 60, 3);
      // console.log(left);
      if (left === 0)
        return json(
          { message: "You can only add 3 replies per minute" },
          { status: 429 }
        );
      const reply = String(form.get("reply"));
      const parentComment = String(form.get("parentComment"));
      const commentUser = String(form.get("commentUser"));
      invariant(reply);
      invariant(commentUser);
      const doc = await replyCommentToBlog(
        blogId,
        userId,
        reply,
        parentComment,
        commentUser,
        user_name,
        picture
      );
      console.log(doc);
      return { message: "added", reply: doc?.reply };
    }
  } catch (error) {
    console.log(error);
    return { error: "Something went Wrong" };
  }
};

// export const shouldRevalidate: ShouldRevalidateFunction = () => {
//     return false;
// };

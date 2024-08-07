import mongoose, { ClientSession, Types } from "mongoose";
import invariant from "tiny-invariant";
import { CommentDoc } from "~/mycomponents/BlogCommentsSheet";
import {
  Blogs,
  Comments,
  NotificationDoc,
  Notifications,
  Replies,
} from "./Schema.server";

export const likeComment = async (commentId: string, userId: string) => {
  const comment = await Comments.findOne(
    { _id: commentId },
    { likedBy: 1, likes: 1, _id: 1 }
  );
  // console.log(comment);

  invariant(comment);
  if (comment.likedBy.find((c) => c._id.toString() === userId)) {
    comment.likes -= 1;
    comment.likedBy = comment.likedBy.filter(
      (_id) => _id.toString() !== userId
    );
    await comment.save();
  } else {
    comment.likes += 1;
    const userObj = new Types.ObjectId(userId);
    comment.likedBy.push(userObj);
    await comment.save();
  }
};
export const deleteComment = async (commentId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  // console.log(blogId, userId);
  try {
    // Update logic for both documents within the transaction block
    const deletedComment = await Comments.findOneAndDelete(
      {
        user: userId,
        _id: commentId,
      },
      { session }
    );
    // console.log(deletedComment);
    // if(deletedComment?.parentComment!==null)
    if (!deletedComment) throw new Error("error deleting");
    await Blogs.updateOne(
      { _id: deletedComment.blogId },
      { $inc: { comments: -1 } },
      { session }
    );
    await Replies.deleteMany(
      { parentComment: deletedComment.id },
      {
        session,
      }
    );
    await session.commitTransaction();
    // console.log(updated);
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error udeleting", error?.message ?? error);
    // return false;
  } finally {
    session.endSession();
  }
};
export const likeReply = async (replyId: string, userId: string) => {
  const reply = await Replies.findOne(
    { _id: replyId },
    { likedBy: 1, likes: 1, _id: 1 }
  );
  // console.log(reply);

  invariant(reply);
  if (reply.likedBy.find((c) => c._id.toString() === userId)) {
    reply.likes -= 1;
    reply.likedBy = reply.likedBy.filter((_id) => _id.toString() !== userId);
    await reply.save();
  } else {
    reply.likes += 1;
    const userObj = new Types.ObjectId(userId);
    reply.likedBy.push(userObj);
    await reply.save();
  }
};
export const deleteReply = async (replyId: string, userId: string) => {
  // console.log(blogId, userId);
  try {
    // Update logic for both documents within the transaction block
    await Replies.deleteOne({
      user: userId,
      _id: replyId,
    });
    // if(deletedComment?.parentComment!==null)
    // console.log(updated);
  } catch (error: any) {
    console.error("Error deleting reply", error?.message ?? error);
    // return false;
  }
};
export const deleteCommentAdmin = async (commentId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  // console.log(blogId, userId);
  try {
    // Update logic for both documents within the transaction block
    const deletedComment = await Comments.findOneAndDelete(
      {
        blogOwner: userId,
        _id: commentId,
      },
      { session }
    );
    // if(deletedComment?.parentComment!==null)
    if (!deletedComment) throw new Error("error deleting");
    await Blogs.updateOne(
      { _id: deletedComment.blogId },
      { $inc: { comments: -1 } },
      { session }
    );
    await Replies.deleteMany(
      { parentComment: deletedComment._id },
      {
        session,
      }
    );
    await session.commitTransaction();

    // console.log(updated);
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error deleting", error?.message ?? "Couldn't be deleted!");
    // return false;
  } finally {
    session.endSession();
  }
};

export async function addCommentToBlog(
  blogId: string,
  userId: string,
  content: string,
  username: string,
  picture?: string
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  // console.log(blogId, userId);
  try {
    // Update logic for both documents within the transaction block
    const blog = await Blogs.findOneAndUpdate(
      { _id: blogId },
      { $inc: { comments: 1 } },
      { projection: { author: 1 }, session }
    );
    invariant(blog?.author);
    const dbcomment = await Comments.create(
      [
        {
          blogId,
          content,
          user: userId,
          blogOwner: blog?.author,
        },
      ],
      { session }
    );
    if (blog.author.toString() !== userId) {
      await sendNotification({
        targetUser: blog.author.toString(),
        link: `/dashboard#dashboardComments`,
        type: "comment",
        session,
      });
    }
    await session.commitTransaction();
    return {
      // @ts-expect-error
      ...dbcomment[0]._doc,
      user: { _id: userId, username, picture },
    } as CommentDoc;
    // console.log(updated);
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error adding comment:", error?.message ?? error);
    // return false;
  } finally {
    session.endSession();
  }
}
export async function replyCommentToBlog(
  blogId: string,
  userId: string,
  content: string,
  parentComment: string,
  commentUser: string,
  username: string,
  picture?: string
) {
  if (commentUser === userId) return;
  const session = await mongoose.startSession();
  session.startTransaction();
  // console.log(blogId, userId);
  try {
    const source = await Comments.findOne({ _id: parentComment });
    if (!source) throw new Error("Comment does not exist");
    const reply = await Replies.create(
      [
        {
          blogId,
          content,
          user: userId,
          parentComment,
        },
      ],
      { session }
    );
    await sendNotification({
      targetUser: commentUser,
      link: `/blogs/${blogId}?comment=${parentComment}`,
      type: "reply",
      session,
    });
    await session.commitTransaction();

    // @ts-expect-error
    const { likedBy, __v, tag, ...doc } = reply[0]._doc;
    // console.log(reply._doc);
    return {
      reply: { ...doc, liked: false, user: { _id: userId, username, picture } },
    };
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error adding reply:", error?.message ?? error);
  } finally {
    session.endSession();
  }
}
export async function tagReply(
  tag: { username: string; replyId: string },
  blogId: string,
  userId: string,
  content: string,
  parentComment: string,
  replyUser: string,
  username: string,
  picture?: string
) {
  if (userId === replyUser) return;
  const session = await mongoose.startSession();
  session.startTransaction();
  // console.log(blogId, userId);
  try {
    const source = await Replies.findOne({ _id: tag.replyId });
    if (!source) throw new Error("Reply does not exist");
    const reply = await Replies.create(
      [
        {
          blogId,
          content,
          user: userId,
          parentComment,
          tag,
        },
      ],
      { session }
    );
    await sendNotification({
      targetUser: replyUser,
      link: `/blogs/${blogId}?comment=${parentComment}&reply=${tag.replyId}`,
      type: "mention",
      session,
    });
    await session.commitTransaction();
    // @ts-expect-error
    const { likedBy, __v, ...doc } = reply[0]._doc;
    return {
      reply: { ...doc, liked: false, user: { _id: userId, username, picture } },
    };
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error tagging reply:", error?.message ?? error);
  } finally {
    session.endSession();
  }
}

async function sendNotification({
  link,
  targetUser,
  type,
  session,
}: Pick<NotificationDoc, "type" | "link"> & {
  targetUser: string;
  session: ClientSession;
}) {
  await Notifications.findOneAndUpdate(
    { link, targetUser, read: false, type },
    {
      $set: { type },
      $inc: { count: 1 },
    },
    { upsert: true, session }
  );
}

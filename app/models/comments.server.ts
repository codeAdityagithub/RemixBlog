import mongoose, { Types } from "mongoose";
import invariant from "tiny-invariant";
import { Blogs, Comments, Replies } from "./Schema.server";

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
        const deletedComment = await Comments.findOneAndDelete({
            user: userId,
            _id: commentId,
        });
        // if(deletedComment?.parentComment!==null)
        if (!deletedComment) throw new Error("error deleting");
        await Blogs.updateOne(
            { _id: deletedComment.blogId },
            { $inc: { comments: -1 } }
        );
        await Replies.deleteMany({ parentComment: deletedComment._id });

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
        reply.likedBy = reply.likedBy.filter(
            (_id) => _id.toString() !== userId
        );
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
        const deletedComment = await Comments.findOneAndDelete({
            blogOwner: userId,
            _id: commentId,
        });
        // if(deletedComment?.parentComment!==null)
        if (!deletedComment) throw new Error("error deleting");
        await Blogs.updateOne(
            { _id: deletedComment.blogId },
            { $inc: { comments: -1 } }
        );
        await Replies.deleteMany({ parentComment: deletedComment._id });

        // console.log(updated);
    } catch (error: any) {
        await session.abortTransaction();
        console.error(
            "Error deleting",
            error?.message ?? "Couldn't be deleted!"
        );
        // return false;
    } finally {
        session.endSession();
    }
};

export async function addCommentToBlog(
    blogId: string,
    userId: string,
    content: string
) {
    const session = await mongoose.startSession();
    session.startTransaction();
    // console.log(blogId, userId);
    try {
        // Update logic for both documents within the transaction block
        const blog = await Blogs.findOneAndUpdate(
            { _id: blogId },
            { $inc: { comments: 1 } },
            { projection: { author: 1 } }
        );
        await Comments.create({
            blogId,
            content,
            user: userId,
            blogOwner: blog?.author,
        });
        // console.log(updated);
    } catch (error: any) {
        await session.abortTransaction();
        console.error("Error updating likes count:", error?.message ?? error);
        // return false;
    } finally {
        session.endSession();
    }
}
export async function replyCommentToBlog(
    blogId: string,
    userId: string,
    content: string,
    parentComment: string
) {
    await Replies.create({ blogId, content, user: userId, parentComment });
}

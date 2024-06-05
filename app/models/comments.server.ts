import invariant from "tiny-invariant";
import { Blogs, Comments, Engagements } from "./Schema.server";
import mongoose, { Types } from "mongoose";

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
        if (deletedComment.parentComment === null) {
            await Blogs.updateOne(
                { _id: deletedComment.blogId },
                { $inc: { comments: -1 } }
            );
        }
        await Comments.deleteMany({ parentComment: deletedComment._id });

        // console.log(updated);
    } catch (error: any) {
        await session.abortTransaction();
        console.error("Error udeleting", error?.message ?? error);
        // return false;
    } finally {
        session.endSession();
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
        if (deletedComment.parentComment === null) {
            await Blogs.updateOne(
                { _id: deletedComment.blogId },
                { $inc: { comments: -1 } }
            );
        }
        await Comments.deleteMany({ parentComment: deletedComment._id });

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
            { $inc: { comments: 1 } }
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
    await Comments.create({ blogId, content, user: userId, parentComment });
}

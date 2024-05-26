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
        await Comments.create({ blogId, content, user: userId });
        await Blogs.updateOne({ _id: blogId }, { $inc: { comments: 1 } });
        // console.log(updated);
    } catch (error: any) {
        await session.abortTransaction();
        console.error("Error updating likes count:", error?.message ?? error);
        // return false;
    } finally {
        session.endSession();
    }
}

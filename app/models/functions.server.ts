import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Blogs, Comments, Engagements, Replies, Users } from "./Schema.server";

export async function verifyLogin(
    email: string,
    password: string
): Promise<{
    _id: string;
    username: string;
    email: string;
    picture?: string;
} | null> {
    const userWithPassword = await Users.findOne({ email: email });
    if (!userWithPassword || !userWithPassword.password) {
        return null;
    }

    const isValid = await bcrypt.compare(password, userWithPassword.password);

    if (!isValid) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
        password: _password,
        _id,
        email: emai,
        username,
        picture,
    } = userWithPassword;

    return picture
        ? { _id: _id.toString(), email: emai, username, picture }
        : { _id: _id.toString(), email: emai, username };
}

export async function register(
    username: string,
    email: string,
    password: string
) {
    const user = await Users.findOne({ $or: [{ email }, { username }] });
    if (user) return null;
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await Users.create({
        username: username,
        password: hashedPassword,
        email: email,
    });
    return createdUser;
}

export async function deleteBlog(blogId: string, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    // console.log(blogId, userId);
    try {
        const deletedBlog = await Blogs.findOneAndDelete({
            _id: blogId,
            author: userId,
        });
        if (!deletedBlog) throw new Error("Blog not deleted");

        await Engagements.deleteMany({ blogId: deletedBlog._id });
        await Comments.deleteMany({ blogId: deletedBlog._id });
        await Replies.deleteMany({ blogId: deletedBlog._id });
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
}
export async function likeBlog(blogId: string, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    // console.log(blogId, userId);
    try {
        // Update logic for both documents within the transaction block
        const has = await Engagements.findOne({ blogId, userId }, { likes: 1 });
        if (has?.likes === 1) {
            await Blogs.updateOne({ _id: blogId }, { $inc: { likes: -1 } });
            await Engagements.updateOne(
                { blogId: blogId, userId: userId },
                { likes: 0 }
            );
        } else if (has?.likes === 0) {
            await Blogs.updateOne({ _id: blogId }, { $inc: { likes: 1 } });

            await Engagements.updateOne(
                {
                    blogId: blogId,
                    userId: userId,
                },
                { likes: 1 }
            );
        }
        await session.commitTransaction();
        // console.log("Likes count updated successfully in both documents!");
    } catch (error: any) {
        await session.abortTransaction();
        console.error("Error updating likes count:", error?.message ?? error);
    } finally {
        session.endSession();
    }
}
export async function isBlogLikedViewed(
    blogId: string,
    userId: string
): Promise<boolean | undefined> {
    const session = await mongoose.startSession();
    session.startTransaction();
    // console.log(blogId, userId);
    try {
        // Update logic for both documents within the transaction block
        const doc = await Engagements.findOne(
            { blogId, userId },
            { likes: 1, _id: 0 },
            { lean: true }
        );
        const liked = doc ? doc.likes === 1 : false;
        if (!doc) {
            await Blogs.updateOne({ _id: blogId }, { $inc: { views: 1 } });
            // console.log(updated);
            await Engagements.create({
                blogId,
                userId,
                views: 1,
            });
        }
        return liked;
    } catch (error: any) {
        await session.abortTransaction();
        console.error("Error updating likes count:", error?.message ?? error);
        // return false;
    } finally {
        session.endSession();
    }
}
export async function incViews(blogId: string) {
    await Blogs.updateOne({ _id: blogId }, { $inc: { views: 1 } });
}

// export async function fillBlogs(userId: string) {
//     const dummy = {
//         title: "First Blog",
//         desc: "This is the first blog post",
//         thumbnail: "https://example.com/thumbnail1.jpg",
//         content: [
//             {
//                 heading: "Introduction",
//                 image: "https://example.com/image1.jpg",
//                 content:
//                     "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//             },
//             // Add more content items as needed
//         ],
//     };
//     const blogs = [];
//     for (let i = 0; i < 50; i++) {
//         blogs.push(dummy);
//     }
//     await Blogs.insertMany(blogs.map((blog) => ({ ...blog, author: userId })));
// }

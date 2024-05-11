import mongoose, { Document, Model, Types } from "mongoose";

// User Document Interface
export interface UserDocument {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReplyDocument {
    content: string;
    userId: Types.ObjectId;
    commentId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Interface
export interface CommentDocument {
    content: string;
    userId: Types.ObjectId;
    postId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Content Schema Interface
interface Content {
    heading: string;
    image?: string;
    content: string;
}

export interface PostDocument {
    title: string;
    desc: string;
    image: string;
    content: Content[];
    author: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
// User Schema
const userSchema = new mongoose.Schema<UserDocument>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

// Reply Schema
const replySchema = new mongoose.Schema<ReplyDocument>(
    {
        content: { type: String, required: true },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comments",
            required: true,
        },
    },
    { timestamps: true }
);

// Comment Schema
const commentSchema = new mongoose.Schema<CommentDocument>(
    {
        content: { type: String, required: true },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Posts",
            required: true,
        },
    },
    { timestamps: true }
);

const contentSchema = new mongoose.Schema<Content>({
    heading: { type: String, required: true },
    image: {
        type: String,
        match: [
            /\bhttps?:\/\/\S+\.(?:png|jpe?g|gif|svg)\b/g,
            "Image must be a valid URL",
        ],
    },
    content: { type: String, required: true },
});

const postSchema = new mongoose.Schema<PostDocument>(
    {
        title: { type: String, required: true, maxLength: 150 },
        desc: { type: String, required: true, maxLength: 250 },
        image: {
            type: String,
            required: true,
            match: [
                /\bhttps?:\/\/\S+\.(?:png|jpe?g|gif|svg)\b/g,
                "Image must be a valid URL",
            ],
        },
        content: { type: [contentSchema], maxLength: 5 },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        // Additional post fields can be added here
    },
    { timestamps: true }
);

export const Users: Model<UserDocument> =
    mongoose.models.Users || mongoose.model<UserDocument>("Users", userSchema);
export const Replies: Model<ReplyDocument> =
    mongoose.models.Replies ||
    mongoose.model<ReplyDocument>("Replies", replySchema);
export const Comments: Model<CommentDocument> =
    mongoose.models.Comments ||
    mongoose.model<CommentDocument>("Comments", commentSchema);
export const Posts: Model<PostDocument> =
    mongoose.models.Posts || mongoose.model<PostDocument>("Posts", postSchema);

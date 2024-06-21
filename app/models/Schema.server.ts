import mongoose, { Document, Model, ObjectId, Types } from "mongoose";

// User Document Interface
export interface UserDocument {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    picture?: string;
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
    _id: Types.ObjectId;
    content: string;
    user: Types.ObjectId;
    blogId: Types.ObjectId;
    likes: number;
    likedBy: Types.ObjectId[];
    blogOwner: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface ReplyDocument {
    _id: Types.ObjectId;
    content: string;
    user: Types.ObjectId;
    blogId: Types.ObjectId;
    likes: number;
    likedBy: Types.ObjectId[];
    parentComment: Types.ObjectId;
    tag?: { username: string; replyId: ObjectId };
    createdAt: Date;
    updatedAt: Date;
}
export interface ReplyDocumentwUser {
    _id: Types.ObjectId;
    content: string;
    user: { username: string; picture?: string; id: ObjectId };
    blogId: Types.ObjectId;
    likes: number;
    likedBy: Types.ObjectId[];
    parentComment: Types.ObjectId;
    tag?: { username: string; replyId: ObjectId };
    createdAt: Date;
    updatedAt: Date;
}
export interface CommentDocumentwUser {
    _id: Types.ObjectId;
    content: string;
    user: { username: string; picture?: string; id: ObjectId };
    blogId: Types.ObjectId;
    likes: number;
    likedBy: Types.ObjectId[];
    blogOwner?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Content Schema Interface

export interface BlogDocument {
    _id: ObjectId;
    title: string;
    desc: string;
    likes: number;
    tags: string[];
    views: number;
    comments: number;
    thumbnail: string;
    content: String;
    author: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface BlogDocumentwUser {
    _id: ObjectId | string | any;
    title: string;
    desc: string;
    likes: number;
    comments: number;
    views: number;
    tags: string[];
    thumbnail: string;
    content: String;
    author: { _id?: string; username?: string; picture?: string };
    createdAt: Date | string;
    updatedAt: Date | string;
}
export interface EngagementDoc {
    _id: string;
    blogId: string | ObjectId;
    userId: string | ObjectId;
    views: number;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
}
// User Schema
const userSchema = new mongoose.Schema<UserDocument>(
    {
        username: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        picture: { type: String },
    },
    { timestamps: true }
);

// Comment Schema
const commentSchema = new mongoose.Schema<CommentDocument>(
    {
        content: { type: String, required: true },
        likes: { type: Number, default: 0 },
        likedBy: { type: [Types.ObjectId], default: [] },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blogs",
            required: true,
        },
        blogOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            index: true,
        },
    },
    { timestamps: true }
);
const replySchema = new mongoose.Schema<ReplyDocument>(
    {
        content: { type: String, required: true },
        likes: { type: Number, default: 0 },
        likedBy: { type: [Types.ObjectId], default: [] },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blogs",
            required: true,
        },
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            index: true,
        },
        tag: {
            username: { type: String },
            replyId: { type: Types.ObjectId, ref: "Replies" },
        },
    },
    { timestamps: true }
);

const blogSchema = new mongoose.Schema<BlogDocument>(
    {
        title: { type: String, required: true, maxLength: 150, index: true },
        desc: { type: String, required: true, maxLength: 250 },
        thumbnail: {
            type: String,
            required: true,
        },
        tags: { type: [String], index: true },
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        content: { type: String, maxLength: 5000 },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        // Additional post fields can be added here
    },
    { timestamps: true }
);

const engagementSchema = new mongoose.Schema<EngagementDoc>(
    {
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blogs",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        likes: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);
const followSchema = new mongoose.Schema(
    {
        follower: { type: Types.ObjectId, ref: "Users", index: true },
        following: { type: Types.ObjectId, ref: "Users", index: true },
    },
    { timestamps: true }
);
followSchema.index({ follower: 1, following: 1 }, { unique: true });
export const Users: Model<UserDocument> =
    mongoose.models.Users || mongoose.model<UserDocument>("Users", userSchema);
export const Follow =
    mongoose.models.Follow || mongoose.model("Follow", followSchema);

export const Comments: Model<CommentDocument> =
    mongoose.models.Comments ||
    mongoose.model<CommentDocument>("Comments", commentSchema);
export const Replies: Model<ReplyDocument> =
    mongoose.models.Replies ||
    mongoose.model<ReplyDocument>("Replies", replySchema);
export const Blogs: Model<BlogDocument> =
    mongoose.models.Blogs || mongoose.model<BlogDocument>("Blogs", blogSchema);
export const Engagements: Model<EngagementDoc> =
    mongoose.models.Engagements ||
    mongoose.model<EngagementDoc>("Engagements", engagementSchema);

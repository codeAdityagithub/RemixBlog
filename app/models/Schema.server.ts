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
    parentComment?: Types.ObjectId;
    blogOwner: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface CommentDocumentwUser {
    _id: Types.ObjectId;
    content: string;
    user: { username: string; picture?: string };
    blogId: Types.ObjectId;
    likes: number;
    likedBy: Types.ObjectId[];
    parentComment?: Types.ObjectId;
    blogOwner?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Content Schema Interface
export interface Content {
    heading: string;
    image?: string;
    content: string;
}

export interface BlogDocument {
    _id: ObjectId;
    title: string;
    desc: string;
    likes: number;
    tags: string[];
    views: number;
    comments: number;
    thumbnail: string;
    content: Content[];
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
    content: Content[];
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
        password: { type: String, required: true },
        picture: { type: String },
    },
    { timestamps: true }
);

// Comment Schema
const commentSchema = new mongoose.Schema<CommentDocument>(
    {
        content: { type: String, required: true },
        likes: { type: Number, default: 0 },
        parentComment: { type: Types.ObjectId, default: null },
        likedBy: { type: [Types.ObjectId], default: [] },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Posts",
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

const contentSchema = new mongoose.Schema<Content>({
    heading: { type: String, required: true },
    image: {
        type: String,
    },
    content: { type: String, required: true },
});

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
export const Blogs: Model<BlogDocument> =
    mongoose.models.Blogs || mongoose.model<BlogDocument>("Blogs", blogSchema);
export const Engagements: Model<EngagementDoc> =
    mongoose.models.Engagements ||
    mongoose.model<EngagementDoc>("Engagements", engagementSchema);

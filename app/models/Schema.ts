const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

// Reply Schema
const replySchema = new mongoose.Schema(
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
const commentSchema = new mongoose.Schema(
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

const contentSchema = new mongoose.Schema({
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

const postSchema = new mongoose.Schema(
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

export const Users =
    mongoose.models.Users || mongoose.model("Users", userSchema);
export const Replies =
    mongoose.models.Replies || mongoose.model("Replies", replySchema);
export const Comments =
    mongoose.models.Comments || mongoose.model("Comments", commentSchema);
export const Posts =
    mongoose.models.Posts || mongoose.model("Posts", postSchema);

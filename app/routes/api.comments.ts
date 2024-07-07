import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { isValidObjectId } from "mongoose";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { CommentDocumentwUser, Comments } from "~/models/Schema.server";
import { deleteCommentAdmin } from "~/models/comments.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const searchParams = new URL(request.url).searchParams;

  if (searchParams.has("commentId")) {
    const commentId = searchParams.get("commentId");
    if (!isValidObjectId(commentId))
      return json({ error: "Invalid commentId" }, { status: 400 });
    const comment = await Comments.findById(commentId, {
      content: 1,
      likes: 1,
      user: 1,
      blogId: 1,
      createdAt: 1,
      blogOwner: 1,
      likedBy: 1,
    })
      .populate("user", { username: 1, picture: 1 })
      .lean();
    if (!comment) return json({ error: "Comment Not found" }, { status: 404 });

    const isLiked = comment.likedBy.some(
      (likedUserId) => likedUserId.toString() === user?._id
    );
    const { likedBy, ...commentWithoutLikedBy } = comment;
    return {
      comment: {
        ...commentWithoutLikedBy,
        liked: isLiked,
      },
    };
  }
  const page = parseInt(searchParams.get("page") ?? "1");
  const skip = (page - 1) * 10;
  if (page > 5) return { comments: [] };
  try {
    await connect();
    let filter: any = {};
    if (searchParams.get("mine") === "true") filter.user = user._id;
    else filter.blogOwner = user._id;
    const comments = await Comments.find(filter, {
      content: 1,
      user: 1,
      blogId: 1,
      createdAt: 1,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .skip(skip)
      .populate("user", { username: 1, picture: 1 })
      .lean();

    return { comments };
  } catch (error) {
    return json({ error: "Somthing went wrong" }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const { _id: userId } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  try {
    const commentId = String(form.get("commentId"));
    invariant(commentId);
    await connect();
    await deleteCommentAdmin(commentId, userId);
    return { message: "deleted" };
  } catch (error) {
    return { error: "Something went Wrong" };
  }
};

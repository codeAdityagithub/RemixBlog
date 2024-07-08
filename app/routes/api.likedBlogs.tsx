import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { Blogs, Engagements } from "~/models/Schema.server";
import { BlogDoc } from "./dashboard.blogs._index";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login?redirectTo=/dashboard/blogs",
  });
  await connect();
  const likedBlogs = await Engagements.find(
    { userId: user._id, likes: 1 },
    { blogId: 1 }
  )
    .populate("blogId", {
      title: 1,
      createdAt: 1,
      likes: 1,
      views: 1,
      comments: 1,
      thumbnail: 1,
    })
    .lean();
  return { likedBlogs };
};

import { AvatarIcon, DotFilledIcon } from "@radix-ui/react-icons";
import {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@remix-run/node";
import {
  Link,
  ShouldRevalidateFunction,
  useLoaderData,
} from "@remix-run/react";
import { Types } from "mongoose";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { TypographyH1 } from "~/components/Typography";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { connect } from "~/db.server";
import { BlogDocumentwUser, Blogs } from "~/models/Schema.server";
import BlogEngagement from "~/mycomponents/BlogEngagement";
import FollowButton from "~/mycomponents/FollowButton";
import TransitionLink from "~/mycomponents/TransitionLink";
import { checkUnauthViewed, readMin } from "~/utils/blogUtils.server";
import { formatTime, useUser } from "~/utils/general";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { blogId } = params;
  invariant(blogId, "No blogId specified");
  if (!Types.ObjectId.isValid(blogId))
    throw json("Invalid BlogId", {
      status: 400,
      statusText: "Invalid BlogId",
    });
  await connect();
  const user = await authenticator.isAuthenticated(request);
  let cookie = null;
  if (!user) {
    cookie = await checkUnauthViewed(request, blogId);
  }
  const blog = (await Blogs.findById(blogId, {
    likes: 0,
    comments: 0,
    updatedAt: 0,
    views: 0,
  })
    .populate("author", {
      username: 1,
      _id: 1,
      picture: 1,
    })
    .lean()) as Omit<
    BlogDocumentwUser,
    "likes" | "comments" | "updatedAt" | "views" | ""
  >;

  if (!blog)
    throw json("Blog Not Found", {
      status: 404,
      statusText: "Requested blog not found",
    });
  // console.log(blog);
  const readTime = readMin(blog.content);
  return cookie
    ? json(
        { blog, readTime },
        {
          headers: {
            "Set-cookie": cookie,
            "Cache-Control": "max-age=14400, s-max-age=86400",
          },
        }
      )
    : json(
        { blog, readTime },
        { headers: { "Cache-Control": "max-age=14400, s-max-age=86400" } }
      );
};

export const meta: MetaFunction = ({ data }) => {
  // @ts-expect-error
  const { title, desc } = data.blog;
  return [
    { title },
    {
      name: "description",
      content: desc,
    },
  ];
};
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  if (!formAction && currentUrl.pathname !== nextUrl.pathname)
    return defaultShouldRevalidate;
  return false;
};
export let headers: HeadersFunction = ({ loaderHeaders }) => {
  return { "Cache-Control": loaderHeaders.get("Cache-Control")! };
};
const BlogPage = () => {
  const { blog, readTime } = useLoaderData<typeof loader>();
  // console.log(liked);
  const user = useUser();
  // console.log(blog.author.picture);
  return (
    <div className="w-full max-w-2xl p-4 bg-background text-foreground">
      <header className="space-y-8 pb-10 mb-8 border-b border-border relative">
        <h1 className="text-3xl md:text-4xl font-bold break-words">
          {blog.title}
        </h1>
        <div className="flex flex-row h-16 items-center gap-4 p-4 rounded-lg">
          <Avatar>
            <TransitionLink to={`/profiles/${blog.author.username}`}>
              <AvatarImage
                alt="Author Avatar"
                src={blog.author.picture}
              />
            </TransitionLink>
            <AvatarFallback>
              <AvatarIcon className="w-full h-full" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <TransitionLink to={`/profiles/${blog.author.username}`}>
                {blog.author.username}
              </TransitionLink>{" "}
              {user?._id === blog.author._id ? null : (
                <>
                  <DotFilledIcon />
                  <FollowButton
                    sm
                    userId={blog.author._id!}
                  />
                </>
              )}
            </div>
            <small className="flex items-center gap-1 text-muted-foreground">
              {readTime} min read <DotFilledIcon /> {formatTime(blog.createdAt)}
            </small>
          </div>
        </div>
        <BlogEngagement />
        <img
          alt="Blog Post Image"
          className="w-full aspect-video object-cover rounded"
          height={360}
          src={blog.thumbnail}
          style={{
            aspectRatio: "640/360",
            objectFit: "cover",
          }}
          width={640}
        />
      </header>
      <main>
        <article
          className="tiptap max-w-full break-words"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        ></article>
      </main>
    </div>
  );
};

export default BlogPage;

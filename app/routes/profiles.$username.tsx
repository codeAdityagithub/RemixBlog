import {
  AvatarIcon,
  ChatBubbleIcon,
  ChevronDownIcon,
  HeartIcon,
} from "@radix-ui/react-icons";
import {
  ActionFunctionArgs,
  HeadersFunction,
  MetaFunction,
  json,
} from "@remix-run/node";
import {
  Link,
  ShouldRevalidateFunction,
  useLoaderData,
} from "@remix-run/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { connect } from "~/db.server";
import { cn } from "~/lib/utils";
import { Blogs, Users } from "~/models/Schema.server";
import { getFollowStats } from "~/models/follow.server";
import FollowButton from "~/mycomponents/FollowButton";
import { formatTime, useUser } from "~/utils/general";

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: "RemixBlog | " + params.username },
    {
      name: "description",
      content: `Profile information for ${params.username}`,
    },
  ];
};

export const loader = async ({ request, params }: ActionFunctionArgs) => {
  const username = params.username;
  invariant(username);

  await connect();
  const user = await Users.findOne(
    { username },
    { email: 0, password: 0, updatedAt: 0 }
  ).lean();
  if (!user)
    throw json("Profile Not Found", {
      status: 404,
      statusText: "Requested profile not found",
    });
  const { followersCount, followingCount } = await getFollowStats(user._id);
  const blogs = await Blogs.find(
    { author: user?._id },
    { title: 1, desc: 1, likes: 1, comments: 1, createdAt: 1, thumbnail: 1 }
  )
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  return json(
    { user, blogs, followersCount, followingCount },
    {
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=200",
      },
    }
  );
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  // console.log(loaderHeaders);
  return { "Cache-Control": loaderHeaders.get("Cache-Control") ?? "" };
};
export const shouldRevalidate: ShouldRevalidateFunction = ({}) => {
  return false;
};

const UserProfile = () => {
  const curuser = useUser();
  const {
    blogs: initialBlogs,
    user,
    followersCount,
    followingCount,
  } = useLoaderData<typeof loader>();
  const {
    data: blogs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["profileBlogs", user.username],
    initialPageParam: 2,
    initialData: { pages: [initialBlogs], pageParams: [1] },
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/profileBlogs`, {
        method: "POST",
        body: JSON.stringify({ userId: user._id, page: pageParam }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Something went wrong");

      return data?.blogs;
    },
    getNextPageParam: (lastPage, _, lastPageParam) => {
      // console.log(lastPageParam);
      return !lastPage || lastPage.length === 0 ? null : lastPageParam + 1;
    },
    staleTime: 1000 * 60 * 60,
  });
  const flatBlogs = useMemo(() => blogs.pages.flat(), [blogs]);
  return (
    <div className="w-full max-w-2xl p-8 h-full bg-background max-h-[calc(100svh-56px)] overflow-auto ver_scroll">
      <div className="flex gap-4 flex-col sm:flex-row items-center border-b border-border p-4 pb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage
            width={96}
            height={96}
            alt={user.username}
            src={user.picture}
            className=""
          ></AvatarImage>
          <AvatarFallback>
            <AvatarIcon
              className="w-full h-full"
              style={{ margin: 0 }}
            />
          </AvatarFallback>
        </Avatar>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <strong className="text-xl text-center sm:text-left">
            {user.username}
          </strong>
          <small className="text-muted-foreground place-self-end self-start hidden sm:block">
            Joined {formatTime(user.createdAt)}
          </small>
          <p className="text-muted-foreground text-sm min-w-fit self-center text-center sm:text-left">
            {followersCount} followers | {followingCount} following
          </p>

          <FollowButton
            variant="default"
            userId={user._id}
          />
        </div>
      </div>
      <div className="pt-4 px-2 space-y-2">
        {blogs.pages[0]?.length === 0 && (
          <div className="text-center">
            {user.username} hasn't uploaded any blogs.
          </div>
        )}
        {flatBlogs.map((blog, ind) => (
          <div
            key={blog._id.toString()}
            className={cn(
              "p-2 py-4 grid grid-cols-4 grid-rows-3 gap-2 place-items-start",
              ind === flatBlogs.length - 1 ? "" : "border-b"
            )}
          >
            <Link
              to={`/blogs/${blog._id}`}
              className="col-span-2 sm:col-span-3 w-full row-span-2"
            >
              <h3 className="text-xl font-bold line-clamp-2">{blog.title}</h3>
              <p className="text-muted-foreground line-clamp-2 ">{blog.desc}</p>
            </Link>
            <img
              alt="Blog Post Image"
              className="row-span-3 col-span-2 sm:col-span-1 w-full max-w-[200px] aspect-video object-cover rounded"
              height={180}
              src={blog.thumbnail}
              width={320}
            />
            <div className="col-span-2 sm:col-span-3 w-full flex items-center gap-4">
              <span className="text-muted-foreground">
                {formatTime(blog.createdAt)}
              </span>
              <span
                title={blog.likes + " likes"}
                className="hidden sm:flex items-center gap-1 cursor-pointer"
              >
                <HeartIcon /> {blog.likes ?? 0}
              </span>
              <span
                title={blog.comments + " responses"}
                className="hidden sm:flex items-center gap-1 cursor-pointer"
              >
                <ChatBubbleIcon /> {blog.comments ?? 0}
              </span>
            </div>
          </div>
        ))}
        <Button
          onClick={() => fetchNextPage({ cancelRefetch: false })}
          disabled={isFetchingNextPage || !hasNextPage}
          className={cn(blogs.pages[0]?.length === 0 && "hidden", "w-full")}
          size="sm"
          variant="ghost"
        >
          <ChevronDownIcon />
        </Button>
      </div>
    </div>
  );
};
export default UserProfile;

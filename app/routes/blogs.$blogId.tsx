import { AvatarIcon, DotFilledIcon } from "@radix-ui/react-icons";
import { HeadersFunction, LoaderFunctionArgs, json } from "@remix-run/node";
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
import { Button } from "~/components/ui/button";
import { connect } from "~/db.server";
import { BlogDocumentwUser, Blogs } from "~/models/Schema.server";
import BlogContent from "~/mycomponents/BlogContent";
import BlogEngagement from "~/mycomponents/BlogEngagement";
import { checkUnauthViewed, readMin } from "~/utils/blogUtils.server";
import { formatTime } from "~/utils/general";

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
            _id: 0,
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

export const shouldRevalidate: ShouldRevalidateFunction = ({}) => {
    return false;
};
export let headers: HeadersFunction = () => {
    return { "Cache-Control": "max-age=3600" };
};
const BlogPage = () => {
    const { blog, readTime } = useLoaderData<typeof loader>();
    // console.log(liked);

    return (
        <div className="w-full max-w-2xl p-4 bg-background text-foreground">
            <header className="space-y-8 pb-10 mb-8 border-b border-border relative">
                <TypographyH1>{blog.title}</TypographyH1>
                <div className="flex flex-row h-16 items-center gap-4 p-4 rounded-lg">
                    <Avatar>
                        <AvatarImage
                            alt="Author Avatar"
                            src={blog.author.picture}
                        />
                        <AvatarFallback>
                            <AvatarIcon className="w-full h-full" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <p className="flex items-center gap-1">
                            <Link to={`/profiles/${blog.author.username}`}>
                                {blog.author.username}
                            </Link>{" "}
                            <DotFilledIcon />{" "}
                            <Button
                                variant="link"
                                size="icon"
                                className="text-sm text-green-500 h-auto w-auto"
                            >
                                Follow
                            </Button>
                        </p>
                        <small className="flex items-center gap-1 text-muted-foreground">
                            {readTime} min read <DotFilledIcon />{" "}
                            {formatTime(blog.createdAt)}
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
                <article className="flex flex-col gap-6">
                    {blog.content.map((content, ind) => (
                        <BlogContent key={`blog${ind}`} {...content} />
                    ))}
                </article>
            </main>
        </div>
    );
};

export default BlogPage;

import {
    AvatarIcon,
    EyeOpenIcon,
    HeartFilledIcon,
} from "@radix-ui/react-icons";
import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    json,
    redirect,
} from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { TypographyH1, TypographyP } from "~/components/Typography";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { connect } from "~/db.server";
import {
    BlogDocument,
    BlogDocumentwUser,
    Blogs,
    Engagements,
} from "~/models/Schema.server";
import { isBlogLiked, likeBlog } from "~/models/functions.server";
import BlogContent from "~/mycomponents/BlogContent";
import BlogEngagement from "~/mycomponents/BlogEngagement";
import { formatTime } from "~/utils/general";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { blogId } = params;
    invariant(blogId, "No blogId specified");
    await connect();
    const user = await authenticator.isAuthenticated(request);
    let liked = false;
    if (user) {
        liked = (await isBlogLiked(blogId, user._id)) ?? false;
    }
    const blog = (await Blogs.findById(blogId).populate("author", {
        username: 1,
        _id: 0,
    })) as BlogDocumentwUser;
    if (!blog)
        throw json("Blog Not Found", {
            status: 404,
            statusText: "Requested blog not found",
        });
    // console.log(blog);
    return { blog, liked };
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
    const _action = (await request.formData()).get("_action");

    const blogId = params.blogId;
    const { _id: userId } = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    invariant(blogId);
    if (_action === "like") {
        await likeBlog(blogId, userId);
    }
    return { ok: true };
};

const BlogPage = () => {
    const { blog, liked } = useLoaderData<typeof loader>();
    console.log(liked);
    return (
        <div className="w-full max-w-2xl p-4 bg-background text-foreground">
            <header className="space-y-8 pb-10 mb-8 border-b border-border relative">
                <TypographyH1>{blog.title}</TypographyH1>
                <div className="flex flex-row h-16 items-center gap-4 p-4 rounded-lg">
                    <AvatarIcon className="h-10 w-10" />
                    <div className="flex flex-col">
                        <TypographyP>{blog.author.username}</TypographyP>
                        <small>{formatTime(blog.createdAt)}</small>
                    </div>
                </div>
                <BlogEngagement
                    _id={blog._id}
                    likes={blog.likes}
                    views={blog.views}
                    liked={liked}
                />
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
                <article>
                    {blog.content.map((content, ind) => (
                        <BlogContent key={`blog${ind}`} {...content} />
                    ))}
                </article>
            </main>
            <footer></footer>
        </div>
    );
};

export default BlogPage;

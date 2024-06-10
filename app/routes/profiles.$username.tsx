import { AvatarIcon, ChatBubbleIcon, HeartIcon } from "@radix-ui/react-icons";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Types } from "mongoose";
import { format } from "sharp";
import invariant from "tiny-invariant";
import { TypographyH2, TypographyLarge } from "~/components/Typography";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { connect } from "~/db.server";
import { Blogs, UserDocument, Users } from "~/models/Schema.server";
import Dashboarduser from "~/mycomponents/cards/Dashboarduser";
import { formatTime } from "~/utils/general";

export const loader = async ({ request, params }: ActionFunctionArgs) => {
    const username = params.username;
    invariant(username);
    // if (!Types.ObjectId.isValid(userId))
    //     throw json("Invalid UserId", {
    //         status: 400,
    //         statusText: "Invalid UserId",
    //     });
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
    const blogs = await Blogs.find(
        { author: user?._id },
        { title: 1, desc: 1, likes: 1, comments: 1, createdAt: 1, thumbnail: 1 }
    )
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    return { user, blogs };
};

const UserProfile = () => {
    const { blogs, user } = useLoaderData<typeof loader>();
    // console.log(user, blogs);
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
                        100 followers
                    </p>
                    <Button
                        variant="default"
                        className="bg-green-600 text-white hover:bg-green-700 w-full max-w-xs place-self-center"
                    >
                        Follow
                    </Button>
                </div>
            </div>
            <div className="p-2 space-y-2">
                {blogs.map((blog) => (
                    <div className="p-2 grid grid-cols-4 grid-rows-3 gap-2 place-items-start">
                        <Link
                            to={`/blogs/${blog._id}`}
                            className="col-span-2 sm:col-span-3 w-full row-span-2"
                        >
                            <h3 className="text-xl font-bold line-clamp-2">
                                {blog.title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-2 ">
                                {blog.desc}
                            </p>
                        </Link>
                        <img
                            alt="Blog Post Image"
                            className="row-span-3 col-span-2 sm:col-span-1 w-full max-w-[200px] aspect-video object-cover rounded"
                            height={180}
                            src={blog.thumbnail}
                            style={{
                                aspectRatio: "640/360",
                                objectFit: "cover",
                            }}
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
            </div>
        </div>
    );
};
export default UserProfile;

import { AvatarIcon } from "@radix-ui/react-icons";
import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction,
} from "@remix-run/node";
import {
    Link,
    ShouldRevalidateFunction,
    useFetcher,
    useLoaderData,
} from "@remix-run/react";
import { ObjectId } from "mongoose";
import { useEffect } from "react";
import { FaI } from "react-icons/fa6";
import { authenticator } from "~/auth.server";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { connect } from "~/db.server";
import { BlogDocument, Follow } from "~/models/Schema.server";
import { unfollow } from "~/models/follow.server";
import DashboardBlogCard from "~/mycomponents/DashboardBlogCard";
import { formatTime } from "~/utils/general";

type BlogDoc = Pick<BlogDocument, "_id" | "desc" | "title" | "updatedAt">;

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    await connect();
    const followers: {
        createdAt: string;
        following: {
            username: string;
            picture?: string;
            _id: ObjectId;
        };
    }[] = await Follow.find(
        { follower: user._id },
        { following: 1, createdAt: 1 }
    )
        .populate("following", {
            username: 1,
            picture: 1,
            _id: 1,
        })
        .lean();
    // console.log(followers[0]);
    return { followers };
};
export const meta: MetaFunction = () => {
    return [
        { title: "RemixBlog | Following" },
        {
            name: "description",
            content: "All the people that you are following",
        },
    ];
};

export const shouldRevalidate: ShouldRevalidateFunction = ({
    defaultShouldRevalidate,
    formAction,
    actionResult,
}) => {
    if (!formAction?.startsWith("/api/follow") || actionResult !== "unfollowed")
        return false;
    return defaultShouldRevalidate;
};

const Following = () => {
    let { followers } = useLoaderData<typeof loader>();
    // console.log(followers);
    const fetcher = useFetcher<any>();
    const { toast } = useToast();
    useEffect(() => {
        if (
            fetcher.data &&
            fetcher.data !== "followed" &&
            fetcher.data !== "unfollowed"
        ) {
            toast({ description: fetcher.data, variant: "destructive" });
        }
    }, [fetcher.data]);
    return (
        <div className="h-full flex flex-col items-center">
            <h2 className="text-xl font-semibold border-b-2 mb-2 border-border">
                Authors you follow
            </h2>
            <div className="w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] overflow-auto ver_scroll flex-1 flex flex-col items-center gap-4">
                {followers.map(({ following: user, createdAt }) => (
                    <div
                        key={user.username}
                        className="flex items-center gap-4 p-4 rounded-md border-b"
                    >
                        <Avatar className="h-14 w-14 outline outline-1 outline-border">
                            <Link to={"/profiles/" + user.username}>
                                <AvatarImage
                                    width={96}
                                    height={96}
                                    alt={user.username}
                                    src={user.picture}
                                ></AvatarImage>
                            </Link>
                            <AvatarFallback>
                                <AvatarIcon
                                    className="w-full h-full"
                                    style={{ margin: 0 }}
                                />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-3 ">
                            <Link to={"/profiles/" + user.username}>
                                <p>{user.username}</p>
                                <small className="text-sm text-muted-foreground">
                                    Followed {formatTime(createdAt)}
                                </small>
                            </Link>
                        </div>
                        <Button
                            disabled={fetcher.state !== "idle"}
                            onClick={(e) => {
                                fetcher.submit(
                                    {
                                        userId: user._id.toString(),
                                        redirect: "/dashboard/following",
                                        isFollowing: `trueT${new Date(
                                            createdAt
                                        ).getTime()}`,
                                    },
                                    {
                                        method: "DELETE",
                                        encType: "application/json",
                                        action: "/api/follow",
                                    }
                                );
                            }}
                            size="sm"
                        >
                            Unfollow
                        </Button>
                    </div>
                ))}
                {followers.length === 0 && (
                    <div className="flex h-full gap-6 flex-col items-center justify-center">
                        <h3 className="text-xl text-muted-foreground font-bold">
                            You are not following anyone
                        </h3>
                        {/* <div className="text-muted-foreground flex flex-col items-center gap-1">
                    <p>Create a new one</p>
                    <Link to="/dashboard/new">
                        <Button>Create Now</Button>
                    </Link>
                </div> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Following;

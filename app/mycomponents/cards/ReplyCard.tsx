import { AvatarIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import {
    FetcherWithComponents,
    Link,
    useFetcher,
    useSearchParams,
} from "@remix-run/react";
import React, { useEffect, useRef, useState } from "react";
import { CommentDoc } from "../BlogCommentsSheet";
import { formatTime, useUser } from "~/utils/general";
import { Button } from "~/components/ui/button";
import { FaRegThumbsUp } from "react-icons/fa";
import ReplyToComment from "../ReplyToComment";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type Props = {
    reply: CommentDoc;
    revalidate: () => void;
    tagPerson: (username: string) => void;
};

const ReplyCard = ({ reply, revalidate, tagPerson }: Props) => {
    const fetcher = useFetcher<any>();
    const user = useUser();
    const divref = useRef<HTMLDivElement>(null);
    const commentHighlight =
        useSearchParams()[0].get("comment") === reply._id.toString();
    useEffect(() => {
        if (
            fetcher.data?.message === "deleted" ||
            fetcher.data?.message === "liked"
        ) {
            revalidate();
        }
    }, [fetcher.data]);

    useEffect(() => {
        if (commentHighlight) {
            divref.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
            });
        }
    }, [commentHighlight]);
    const replyTo = () => {
        tagPerson(reply.user.username);
    };

    return (
        <div
            ref={divref}
            className={cn(
                "p-1 border border-border rounded-md space-y-2",
                commentHighlight ? "bg-secondary" : ""
            )}
        >
            <div className="flex flex-row items-center gap-4">
                <Avatar className="h-9 w-9">
                    <Link to={`/profiles/${reply.user.username}`}>
                        <AvatarImage
                            width={96}
                            height={96}
                            alt={reply.user.username}
                            src={reply.user.picture}
                            className=""
                        ></AvatarImage>
                    </Link>
                    <AvatarFallback>
                        <AvatarIcon
                            className="w-full h-full"
                            style={{ margin: 0 }}
                        />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <p className="text-sm">
                        <Link to={`/profiles/${reply.user.username}`}>
                            {reply.user.username}
                        </Link>
                        {reply.user.username === user?.username && " (You)"}
                    </p>
                    <small className="text-muted-foreground">
                        {formatTime(reply.createdAt.toString())}
                    </small>
                </div>
                <ReplyMenu
                    isOwner={reply.user.username === user?.username}
                    replyId={reply._id.toString()}
                    fetcher={fetcher}
                    reply={replyTo}
                />
            </div>
            <p className="line-clamp-3 break-words">{reply.content}</p>
            <div className="flex justify-between items-start relative">
                <LikeButton
                    replyId={reply._id.toString()}
                    liked={reply.liked}
                    fetcher={fetcher}
                    likes={reply.likes}
                />
            </div>
        </div>
    );
};

function LikeButton({
    likes,
    liked,
    replyId,
    fetcher,
}: {
    likes: number;
    liked: boolean;
    replyId: string;
    fetcher: FetcherWithComponents<any>;
}) {
    const [state, setState] = useState({ likes, liked });

    return (
        <form
            className="top-2 left-0"
            onSubmit={(e) => {
                e.preventDefault();
                setState((prev) => ({
                    likes: prev.likes + (liked ? -1 : 1),
                    liked: !prev.liked,
                }));
                // console.log(likes);
                fetcher.submit(
                    { _action: "likeReply", replyId },
                    { action: "replies", method: "POST" }
                );
            }}
        >
            <Button
                type="submit"
                size="sm"
                className="flex gap-2 px-2"
                variant="ghost"
            >
                <FaRegThumbsUp className={state.liked ? "text-blue-600" : ""} />
                {state.likes}
            </Button>
        </form>
    );
}
function ReplyMenu({
    replyId,
    fetcher,
    isOwner,
    reply,
}: {
    replyId: string;
    isOwner: boolean;
    fetcher: FetcherWithComponents<any>;
    reply: () => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="ml-auto mr-2">
                <DotsVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel className="text-center">
                    Reply Menu
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isOwner ? (
                    <DropdownMenuItem asChild>
                        <Button
                            disabled={fetcher.state !== "idle"}
                            onClick={() =>
                                fetcher.submit(
                                    { _action: "deleteReply", replyId },
                                    { method: "POST", action: "replies" }
                                )
                            }
                            size="sm"
                            variant="destructive"
                            className="hover:cursor-pointer w-full"
                        >
                            Delete Reply
                        </Button>
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem asChild>
                        <Button
                            onClick={reply}
                            size="sm"
                            variant="secondary"
                            className="hover:cursor-pointer w-full"
                        >
                            Reply
                        </Button>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ReplyCard;

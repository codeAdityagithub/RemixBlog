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
    comment: CommentDoc;
    revalidate: () => void;
};

const CommentCard = ({ comment, revalidate }: Props) => {
    const fetcher = useFetcher<any>();
    const user = useUser();
    const divref = useRef<HTMLDivElement>(null);
    const commentHighlight =
        useSearchParams()[0].get("comment") === comment._id.toString();
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
            // console.log(commentHighlight);
            divref.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
            });
            divref.current?.classList.add("bg-secondary");
            setTimeout(() => {
                divref.current?.classList.remove("bg-secondary");
            }, 1000);
        }
    }, [commentHighlight, comment]);

    return (
        <div
            ref={divref}
            className="p-2 border border-border rounded-md space-y-2 has-[.repliesOpen]:border-primary/65"
        >
            <div className="flex flex-row items-center gap-4">
                <Avatar className="h-9 w-9">
                    <Link to={`/profiles/${comment.user.username}`}>
                        <AvatarImage
                            width={96}
                            height={96}
                            alt={comment.user.username}
                            src={comment.user.picture}
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
                        <Link to={`/profiles/${comment.user.username}`}>
                            {comment.user.username}
                        </Link>
                        {comment.user.username === user?.username && " (You)"}
                    </p>
                    <small className="text-muted-foreground">
                        {formatTime(comment.createdAt.toString())}
                    </small>
                </div>
                {comment.user.username === user?.username && (
                    <DeleteButton
                        commentId={comment._id.toString()}
                        fetcher={fetcher}
                    />
                )}
            </div>
            <p className="line-clamp-3 break-words">{comment.content}</p>
            <div className="flex justify-between items-start relative">
                <LikeButton
                    commentId={comment._id.toString()}
                    liked={comment.liked}
                    fetcher={fetcher}
                    likes={comment.likes}
                />
                <ReplyToComment commentId={comment._id.toString()} />
            </div>
        </div>
    );
};

function LikeButton({
    likes,
    liked,
    commentId,
    fetcher,
}: {
    likes: number;
    liked: boolean;
    commentId: string;
    fetcher: FetcherWithComponents<any>;
}) {
    const [state, setState] = useState({ likes, liked });
    // if (fetcher.formData?.get("_action") === "likeComment") {
    //     setState((prev) => ({
    //         likes: prev.likes + (liked ? -1 : 1),
    //         liked: !prev.liked,
    //     }));
    // }

    return (
        <form
            className="absolute top-0 left-0"
            onSubmit={(e) => {
                e.preventDefault();
                setState((prev) => ({
                    likes: prev.likes + (liked ? -1 : 1),
                    liked: !prev.liked,
                }));
                fetcher.submit(
                    { _action: "likeComment", commentId },
                    { action: "comments", method: "POST" }
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
function DeleteButton({
    commentId,
    fetcher,
}: {
    commentId: string;
    fetcher: FetcherWithComponents<any>;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="ml-auto mr-2">
                <DotsVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Comment Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Button
                        disabled={fetcher.state !== "idle"}
                        onClick={() =>
                            fetcher.submit(
                                { _action: "deleteComment", commentId },
                                { method: "POST", action: "comments" }
                            )
                        }
                        size="sm"
                        variant="destructive"
                        className="hover:cursor-pointer"
                    >
                        Delete Comment
                    </Button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default CommentCard;

import { AvatarIcon, DotFilledIcon } from "@radix-ui/react-icons";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { CommentDocumentwUser } from "~/models/Schema.server";
import { formatTime, useUser } from "~/utils/general";
import { FaRegThumbsUp } from "react-icons/fa";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";

import type { BlogDoc } from "./BlogCommentsSheet";
import { useFetcher } from "@remix-run/react";
type Props = {
    comments: BlogDoc[] | undefined;
};

const CommentList = ({ comments: initialComments }: Props) => {
    const [comments, setComments] = useState(initialComments);
    const [sorting, setSorting] = useState("mostRelevant");
    const user = useUser();
    useEffect(() => {
        handleSort(sorting);
        // setComments(initialComments?.sort((a, b) => b.likes - a.likes));
    }, [initialComments]);
    const fetcher = useFetcher();
    useEffect(() => {
        if (fetcher.formData?.get("_action") === "likeComment") {
            const newComments = comments?.map((comment) => {
                if (
                    comment._id.toString() ===
                    fetcher.formData?.get("commentId")
                ) {
                    return {
                        ...comment,
                        likes: comment.likes + (comment.liked ? -1 : 1),
                        liked: !comment.liked,
                    };
                } else {
                    return comment;
                }
            });
            setComments(newComments);
        }
    }, [fetcher.formData]);
    function handleSort(value: string) {
        // console.log(value);
        setComments((prev) =>
            initialComments?.sort((a, b) => {
                if (value === "mostRelevant") {
                    return b.likes - a.likes;
                } else {
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                }
            })
        );
    }
    return (
        <div className="flex flex-col gap-2">
            <Select
                onValueChange={(value) => {
                    setSorting(value);
                    handleSort(value);
                }}
            >
                <SelectTrigger className="w-full my-4">
                    <SelectValue placeholder="mostRelevant" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="mostRelevant">Most Relevant</SelectItem>
                    <SelectItem value="mostRecent">Most Recent</SelectItem>
                </SelectContent>
            </Select>

            {comments &&
                (comments.length === 0 ? (
                    <p className="p-2 text-muted-foreground">
                        There are no responses
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div className="space-y-2" key={comment._id.toString()}>
                            <div className="flex flex-row items-center gap-4">
                                <AvatarIcon className="h-8 w-8" />
                                <div className="flex flex-col">
                                    <p className="text-sm">
                                        {comment.user.username}
                                    </p>
                                    <small className="text-muted-foreground">
                                        {formatTime(
                                            comment.createdAt.toString()
                                        )}
                                    </small>
                                </div>
                            </div>
                            <p className="line-clamp-3">{comment.content}</p>
                            <div className="flex justify-between">
                                <fetcher.Form method="POST" action="comments">
                                    <input
                                        type="hidden"
                                        name="_action"
                                        value="likeComment"
                                    />
                                    <input
                                        type="hidden"
                                        name="commentId"
                                        value={comment._id.toString()}
                                    />

                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="flex gap-2"
                                        variant="ghost"
                                    >
                                        <FaRegThumbsUp
                                            className={
                                                comment.liked
                                                    ? "text-blue-600"
                                                    : ""
                                            }
                                        />
                                        {comment.likes}
                                    </Button>
                                </fetcher.Form>
                                <Button
                                    size="sm"
                                    className="flex gap-2"
                                    variant="link"
                                >
                                    Reply
                                </Button>
                            </div>
                        </div>
                    ))
                ))}
        </div>
    );
};

export default CommentList;

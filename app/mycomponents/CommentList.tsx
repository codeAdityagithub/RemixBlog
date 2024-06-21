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

import type { CommentDoc } from "./BlogCommentsSheet";
import { useFetcher } from "@remix-run/react";
import { Separator } from "~/components/ui/separator";
import ReplyToComment from "./ReplyToComment";
import CommentCard from "./cards/CommentCard";
type Props = {
    comments: CommentDoc[] | undefined;
    revalidate: () => void;
};

const CommentList = ({ comments: initialComments, revalidate }: Props) => {
    const [comments, setComments] = useState(initialComments);
    const [sorting, setSorting] = useState("mostRelevant");
    useEffect(() => {
        handleSort(sorting);
        // setComments(initialComments?.sort((a, b) => b.likes - a.likes));
    }, [initialComments]);

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
            <Separator />
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
                        <CommentCard
                            key={comment._id.toString()}
                            comment={comment}
                            revalidate={revalidate}
                        />
                    ))
                ))}
        </div>
    );
};

export default CommentList;

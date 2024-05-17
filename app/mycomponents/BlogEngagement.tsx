import {
    ArchiveIcon,
    EyeOpenIcon,
    HeartFilledIcon,
    HeartIcon,
    Share1Icon,
} from "@radix-ui/react-icons";
import { Button } from "~/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import { successToastStyle } from "~/utils/general";
import { useFetcher } from "@remix-run/react";
import { MouseEvent, useEffect, useState } from "react";

type Props = {
    likes: number;
    views: number;
    _id: string;
    liked: boolean;
};

const BlogEngagement = ({ likes, views, _id, liked }: Props) => {
    const fetcher = useFetcher();
    const copytoClipboard = () => {
        const copied = copy(`${window.location.href}`);
        if (copied) {
            toast.success("URL copied successfully", {
                style: successToastStyle,
            });
        }
    };
    const likeBlog = () => {
        fetcher.submit(
            { _action: "like" },
            { action: `/blogs/${_id}`, method: "POST" }
        );
    };
    if (fetcher.formData?.get("_action") === "like") {
        likes = liked ? likes - 1 : likes + 1;
        liked = !liked;
    }
    return (
        <div className="flex justify-between w-full border-t border-b border-border py-2">
            <div className="flex gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="flex gap-2 items-center"
                            >
                                <EyeOpenIcon />
                                {views}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Blog views</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={likeBlog}
                                size="sm"
                                variant="ghost"
                                className="flex gap-2 items-center"
                            >
                                {liked ? (
                                    <HeartFilledIcon className="animate-heart" />
                                ) : (
                                    <HeartIcon />
                                )}{" "}
                                <span>{likes}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Like the blog</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <div className="flex gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <ArchiveIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Save</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger onClick={copytoClipboard} asChild>
                            <Button size="sm" variant="ghost">
                                <Share1Icon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Share</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};

export default BlogEngagement;

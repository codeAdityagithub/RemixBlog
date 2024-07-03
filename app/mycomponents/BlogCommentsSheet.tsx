import { ChatBubbleIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "~/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";

import { Separator } from "~/components/ui/separator";
import useComments from "~/hooks/useComments";
import { CommentDocumentwUser } from "~/models/Schema.server";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import CommentLoader from "./loaders/CommentLoader";
type Props = {
    comments: number;
};
export type CommentDoc = Omit<CommentDocumentwUser, "likedBy" | "_id"> & {
    liked: boolean;
    _id: string;
};

const BlogCommentsSheet = ({ comments: commentsNumber }: Props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const commentHighlight = searchParams.has("comment");
    const [open, setOpen] = useState(false);
    const {
        comments,
        fetchComments,
        updateCommentsLiked,
        deleteComment,
        setSortBy,
        sortBy,
        hasMore,
        isLoading,
        addComment,
    } = useComments({ enabled: open });
    // console.log(fetcher.data);

    const revalidate = ({
        message,
        commentId,
    }: {
        message: "liked" | "deleted";
        commentId: string;
    }) => {
        if (message === "liked") updateCommentsLiked(commentId);
        if (message === "deleted") deleteComment(commentId);
    };

    useEffect(() => {
        if (commentHighlight) setOpen(true);
    }, [commentHighlight]);
    return (
        <Sheet
            open={open}
            onOpenChange={(open) => {
                // console.log("opened");
                if (!open && commentHighlight) {
                    setSearchParams(
                        (prev) => {
                            prev.delete("comment");
                            prev.delete("reply");
                            return prev;
                        },
                        { preventScrollReset: true }
                    );
                }

                setOpen(open);
            }}
        >
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SheetTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="flex gap-2 items-center"
                            >
                                <ChatBubbleIcon />
                                {commentsNumber}
                            </Button>
                        </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Respond</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <SheetContent className="w-full xs:w-[350px] sm:w-[540px] flex flex-col gap-4 max-h-screen scroll-smooth overflow-auto ver_scroll">
                <SheetHeader>
                    <SheetTitle className="text-xl">
                        Responses ({commentsNumber})
                    </SheetTitle>
                </SheetHeader>
                {/* form for comments */}
                <CommentForm
                    revalidate={(comment: CommentDoc) => {
                        addComment(comment);
                    }}
                />
                <Separator />
                <Select
                    value={sortBy}
                    onValueChange={(value: "likes" | "createdAt") => {
                        setSortBy(value);
                    }}
                >
                    <SelectTrigger className="w-full my-3">
                        <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="likes">Most Relevant</SelectItem>
                        <SelectItem value="createdAt">Most Recent</SelectItem>
                    </SelectContent>
                </Select>
                <CommentList comments={comments} revalidate={revalidate} />

                {isLoading && comments.length === 0 && (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 3 }).map((i, ind) => (
                            <CommentLoader key={ind} />
                        ))}
                    </div>
                )}
                <Button
                    variant="secondary"
                    onClick={() => {
                        fetchComments();
                    }}
                    disabled={isLoading || !hasMore}
                >
                    <ChevronDownIcon />
                </Button>
            </SheetContent>
        </Sheet>
    );
};

export default BlogCommentsSheet;

import { ChatBubbleIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useFetcher, useParams, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
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
import { CommentDocumentwUser } from "~/models/Schema.server";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import CommentLoader from "./loaders/CommentLoader";
type Props = {
    comments: number;
};
export type CommentDoc = Omit<CommentDocumentwUser, "likedBy"> & {
    liked: boolean;
};

const BlogCommentsSheet = ({ comments: commentsNumber }: Props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const commentHighlight = !!searchParams.get("comment");
    const [open, setOpen] = useState(commentHighlight);
    const params = useParams();
    let fetcher = useFetcher<any>();
    const [comments, setComments] = useState<CommentDoc[]>([]);
    const page = useRef<number | null>(1);
    // console.log(fetcher.data);
    useEffect(() => {
        if (fetcher.data) {
            console.log(fetcher.data.append);
            if (!fetcher.data.append) {
                setComments(fetcher.data.comments as CommentDoc[]);
            } else {
                setComments((prev) => [
                    ...prev,
                    ...(fetcher.data.comments as CommentDoc[]),
                ]);
            }
        }
    }, [fetcher.data]);

    function revalidate() {
        fetcher.load(
            `/blogs/${params.blogId}/comments?page=${page.current}&all=true`
        );
    }

    useEffect(() => {
        if (commentHighlight) fetchComments();
    }, [commentHighlight]);
    const fetchComments = () => {
        fetcher.load(`/blogs/${params.blogId}/comments?page=${page.current}`);
    };
    return (
        <Sheet
            open={open}
            onOpenChange={(open) => {
                // console.log("opened");
                if (!open && commentHighlight) {
                    setSearchParams(
                        (prev) => {
                            prev.delete("comment");
                            return prev;
                        },
                        { preventScrollReset: true }
                    );
                }
                if (open && !fetcher.data) {
                    fetchComments();
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
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col gap-4 max-h-screen overflow-auto ver_scroll">
                <SheetHeader>
                    <SheetTitle className="text-xl">
                        Responses ({commentsNumber})
                    </SheetTitle>
                </SheetHeader>
                {/* form for comments */}
                <CommentForm revalidate={revalidate} />
                <CommentList comments={comments} revalidate={revalidate} />
                {fetcher.state === "loading" && comments.length === 0 && (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 3 }).map((i, ind) => (
                            <CommentLoader key={ind} />
                        ))}
                    </div>
                )}
                <Button
                    variant="secondary"
                    onClick={() => {
                        if (page.current) {
                            page.current += 1;
                            fetchComments();
                        }
                    }}
                    disabled={
                        fetcher.state !== "idle" ||
                        fetcher.data?.comments.length === 0
                    }
                >
                    <ChevronDownIcon />
                </Button>
            </SheetContent>
        </Sheet>
    );
};

export default BlogCommentsSheet;

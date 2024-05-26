import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { useFetcher, useParams } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
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
import { CommentDocument, CommentDocumentwUser } from "~/models/Schema.server";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
type Props = {
    comments: number;
};
export type BlogDoc = Omit<CommentDocumentwUser, "likedBy"> & {
    liked: boolean;
};

const BlogCommentsSheet = ({ comments: commentsNumber }: Props) => {
    const params = useParams();
    let fetcher = useFetcher();
    let [comments, setComments] = useState<BlogDoc[]>();
    // console.log(fetcher.data);
    useEffect(() => {
        if (fetcher.data) {
            setComments(
                // @ts-expect-error
                fetcher.data.comments as unknown as BlogDoc
            );
        }
    }, [fetcher]);
    // const addComment = useCallback((data: CommentDocumentwUser) => {
    //     setComments((prev) => [...prev, data]);
    // }, []);
    return (
        <Sheet
            onOpenChange={(open) => {
                if (open && !fetcher.data) {
                    fetcher.load(`/blogs/${params.blogId}/comments`);
                }
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
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col gap-4 max-h-screen overflow-auto">
                <SheetHeader>
                    <SheetTitle className="text-xl">
                        Responses ({commentsNumber})
                    </SheetTitle>
                </SheetHeader>
                <CommentForm />
                <CommentList comments={comments} />
            </SheetContent>
        </Sheet>
    );
};

export default BlogCommentsSheet;

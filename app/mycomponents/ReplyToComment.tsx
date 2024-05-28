import { useFetcher, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    MyAccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { CommentDoc } from "./BlogCommentsSheet";
import CommentCard from "./cards/CommentCard";
import CommentLoader from "./loaders/CommentLoader";

type Props = {
    commentId: string;
    isOwner: boolean;
};

const ReplyToComment = ({ commentId, isOwner }: Props) => {
    // const fetcher1 = useFetcher<any>({ key: `load-replies${commentId}` });
    const fetcher2 = useFetcher<any>({ key: `post-reply${commentId}` });
    const [replies, setReplies] = useState<CommentDoc[] | null>(null);
    const [comment, setComment] = useState("");
    const blogId = useParams().blogId;

    // useEffect(() => {
    //     if (fetcher1.data && fetcher1.data.replies) {
    //         setReplies(fetcher1.data.replies as CommentDoc[]);
    //         // console.log(fetcher1.data.replies);
    //     }
    // }, [fetcher1.data]);
    useEffect(() => {
        if (fetcher2.data?.ok) {
            console.log("fetching replies");
            setComment("");
            fetchReplies();
        }
    }, [fetcher2.data]);

    async function fetchReplies() {
        // if (fetcher1.state === "idle") fetcher1.load(`comments/${commentId}`);
        const data = await fetch(`/blogs/${blogId}/comments/${commentId}`).then(
            (res) => res.json()
        );
        setReplies(data.replies);
    }
    return (
        <Accordion className="w-full space-y-2" type="multiple">
            {!isOwner ? (
                <AccordionItem className="border-none" value="replyto">
                    <AccordionTrigger className="flex justify-end py-2">
                        Reply
                    </AccordionTrigger>
                    <AccordionContent className="w-full p-2 mt-2">
                        <fetcher2.Form
                            method="POST"
                            action={`comments/${commentId}`}
                            // onSubmit={(e) => {
                            //     e.preventDefault();
                            //     fetcher2.submit(e.currentTarget, {
                            //         action: `comments/${commentId}`,
                            //         method: "POST",
                            //         navigate: false,
                            //     });
                            // }}
                        >
                            <Textarea
                                name="comment"
                                className="w-full"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                                placeholder="Write your reply here..."
                            />
                            <Button
                                type="submit"
                                className="mt-1"
                                size="sm"
                                disabled={
                                    fetcher2.state === "submitting" ||
                                    comment.length === 0
                                }
                            >
                                reply
                            </Button>
                        </fetcher2.Form>
                    </AccordionContent>
                </AccordionItem>
            ) : null}
            <AccordionItem
                value="replies"
                className={`border-none ${isOwner ? "mt-11" : ""}`}
            >
                <MyAccordionTrigger asChild>
                    <Button
                        onClick={(e) => {
                            const state = e.currentTarget.dataset.state;
                            if (state === "closed" && !replies) fetchReplies();
                        }}
                        size="sm"
                        variant="outline"
                    >
                        Replies
                    </Button>
                </MyAccordionTrigger>
                <AccordionContent className="w-full mt-2 space-y-1">
                    {replies ? (
                        replies.length === 0 ? (
                            <p>No replies on this comment</p>
                        ) : (
                            replies.map((comment) => (
                                <CommentCard
                                    key={comment._id.toString()}
                                    comment={comment}
                                />
                            ))
                        )
                    ) : (
                        <CommentLoader />
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default ReplyToComment;

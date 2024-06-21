import { useFetcher, useParams } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
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
import ReplyCard from "./cards/ReplyCard";
import { ReplyDocumentwUser } from "~/models/Schema.server";

type Props = {
    commentId: string;
};

type ReplyDoc = Omit<ReplyDocumentwUser, "likedBy"> & {
    liked: boolean;
};

const ReplyToComment = ({ commentId }: Props) => {
    // const fetcher1 = useFetcher<any>({ key: `load-replies${commentId}` });
    const fetcher = useFetcher<any>();
    const [replies, setReplies] = useState<ReplyDoc[] | null>(null);
    const [reply, setReply] = useState("");
    const blogId = useParams().blogId;

    useEffect(() => {
        if (fetcher.data?.message === "added") {
            setReply("");
            fetchReplies();
        }
    }, [fetcher.data]);

    const fetchReplies = useCallback(async () => {
        // if (fetcher1.state === "idle") fetcher1.load(`comments/${commentId}`);
        const data = await fetch(
            `/blogs/${blogId}/replies?parentComment=${commentId}`
        ).then((res) => res.json());
        setReplies(data.replies);
    }, []);
    const tagPerson = useCallback((username: string) => {
        console.log(username);
    }, []);
    return (
        <Accordion className="w-full space-y-2" type="multiple">
            <AccordionItem className="border-none" value="replyto">
                <AccordionTrigger className="flex justify-end py-1 pr-2">
                    Reply
                </AccordionTrigger>
                <AccordionContent className="w-full p-2 mt-2">
                    <fetcher.Form method="POST" action={`replies`}>
                        <input
                            type="hidden"
                            name="parentComment"
                            value={commentId}
                        />
                        <Textarea
                            name="reply"
                            className="w-full"
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            required
                            placeholder="Write your reply here..."
                        />
                        <Button
                            type="submit"
                            className="mt-1"
                            name="_action"
                            value="replyComment"
                            size="sm"
                            disabled={
                                fetcher.state === "submitting" ||
                                reply.trim().length === 0
                            }
                        >
                            reply
                        </Button>
                    </fetcher.Form>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="replies" className="border-none">
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
                <AccordionContent className="w-full mt-2 space-y-2">
                    {replies ? (
                        replies.length === 0 ? (
                            <p className="px-2">No replies on this comment</p>
                        ) : (
                            replies.map((reply) => (
                                <ReplyCard
                                    key={reply._id.toString()}
                                    reply={reply}
                                    revalidate={fetchReplies}
                                    tagPerson={tagPerson}
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

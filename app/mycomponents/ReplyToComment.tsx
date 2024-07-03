import { useFetcher, useParams, useSearchParams } from "@remix-run/react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useUser } from "~/utils/general";

type Props = {
  commentId: string;
  commentUser: string;
};

type ReplyDoc = Omit<ReplyDocumentwUser, "likedBy"> & {
  liked: boolean;
};

const ReplyToComment = ({ commentId, commentUser }: Props) => {
  // const fetcher1 = useFetcher<any>({ key: `load-replies${commentId}` });
  const user = useUser();
  const fetcher = useFetcher<any>();
  const [replies, setReplies] = useState<ReplyDoc[] | null>(null);
  const [reply, setReply] = useState("");
  const blogId = useParams().blogId;
  const searchParams = useSearchParams()[0];
  const replyHiglight = searchParams.get("reply");
  const isCurrent = searchParams.get("comment") === commentId;
  const btnref = useRef<HTMLButtonElement>(null);
  const isFetching = useRef(false);
  useEffect(() => {
    if (fetcher.data?.message === "added") {
      setReply("");
      fetchReplies();
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (replyHiglight && isCurrent) {
      if (replies === null)
        fetchReplies().then(() => {
          if (btnref.current?.dataset.state === "closed")
            btnref.current?.click();
        });
      else if (btnref.current?.dataset.state === "closed")
        btnref.current?.click();
    }
  }, [replyHiglight]);

  const fetchReplies = useCallback(async () => {
    // if (fetcher1.state === "idle") fetcher1.load(`comments/${commentId}`);
    if (!isFetching.current) {
      isFetching.current = true;
      const data = await fetch(
        `/blogs/${blogId}/replies?parentComment=${commentId}`
      ).then((res) => res.json());
      setReplies(data.replies);
      isFetching.current = false;
    }
  }, []);

  return (
    <Accordion
      className="w-full space-y-2"
      type="multiple"
    >
      <AccordionItem
        className={`border-none ${commentUser === user?._id ? "hidden" : ""}`}
        value="replyto"
      >
        <AccordionTrigger className="flex justify-end py-1 pr-2">
          Reply
        </AccordionTrigger>
        <AccordionContent className="w-full p-2 mt-2">
          <fetcher.Form
            method="POST"
            action="replies"
          >
            <input
              type="hidden"
              name="parentComment"
              value={commentId}
            />
            <input
              type="hidden"
              name="commentUser"
              value={commentUser}
            />
            <small className="text-red-600 w-full">
              {fetcher.data?.message !== "added" && fetcher.data?.message}
            </small>
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
                fetcher.state === "submitting" || reply.trim().length === 0
              }
            >
              reply
            </Button>
          </fetcher.Form>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="replies"
        className="border-none"
      >
        <MyAccordionTrigger asChild>
          <Button
            ref={btnref}
            className={`${commentUser === user?._id ? "mt-7" : ""}`}
            onClick={(e) => {
              const state = e.currentTarget.dataset.state;

              if (state === "closed" && replies === null) {
                fetchReplies();
              }
              if (state === "closed")
                e.currentTarget.classList.add("bg-secondary", "repliesOpen");
              else {
                e.currentTarget.classList.remove("bg-secondary", "repliesOpen");
              }
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

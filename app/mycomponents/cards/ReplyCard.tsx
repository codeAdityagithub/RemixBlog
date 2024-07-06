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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { ReplyDocument, ReplyDocumentwUser } from "~/models/Schema.server";
import TransitionLink from "../TransitionLink";

type Props = {
  reply: Omit<ReplyDocumentwUser, "likedBy" | "_id"> & {
    liked: boolean;
    _id: string;
  };
  revalidate: (data: any) => void;
};

const ReplyCard = ({ reply, revalidate }: Props) => {
  const fetcher = useFetcher<any>();
  const user = useUser();
  const divref = useRef<HTMLDivElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (
      fetcher.data?.message === "deleted" ||
      fetcher.data?.message === "liked" ||
      fetcher.data?.message === "tagged"
    ) {
      revalidate(fetcher.data);
      if (fetcher.data?.message === "tagged") {
        setSearchParams(
          (prev) => {
            prev.set("tag", fetcher.data?.reply._id);
            return prev;
          },
          { replace: true }
        );
        setTimeout(
          () =>
            setSearchParams(
              (prev) => {
                prev.delete("tag");
                return prev;
              },
              { replace: true }
            ),
          500
        );
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (searchParams.get("tag") === reply._id.toString()) {
      divref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [searchParams.get("tag")]);
  useEffect(() => {
    if (searchParams.get("reply") === reply._id.toString()) {
      setTimeout(
        () =>
          divref.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          }),
        300
      );
      setTimeout(
        () =>
          setSearchParams(
            (prev) => {
              prev.delete("reply");
              return prev;
            },
            { replace: true }
          ),
        1000
      );
    }
  }, [searchParams.get("reply")]);

  return (
    <div
      ref={divref}
      id={`replycard-${reply._id.toString()}`}
      className={cn(
        "p-1 border border-primary/25 rounded-md space-y-2 transition-colors",
        searchParams.get("tag") === reply._id.toString() ||
          searchParams.get("reply") === reply._id.toString()
          ? "bg-secondary"
          : ""
      )}
    >
      <div className="flex flex-row items-center gap-4">
        <Avatar className="h-9 w-9">
          <TransitionLink to={`/profiles/${reply.user.username}`}>
            <AvatarImage
              width={96}
              height={96}
              alt={reply.user.username}
              src={reply.user.picture}
              className=""
            ></AvatarImage>
          </TransitionLink>
          <AvatarFallback>
            <AvatarIcon
              className="w-full h-full"
              style={{ margin: 0 }}
            />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm">
            <TransitionLink to={`/profiles/${reply.user.username}`}>
              {reply.user.username}
            </TransitionLink>
            {reply.user.username === user?.username && " (You)"}
          </p>
          <small className="text-muted-foreground">
            {formatTime(reply.createdAt.toString())}
          </small>
        </div>
        {reply.user.username === user?.username ? (
          <ReplyMenu
            replyId={reply._id.toString()}
            fetcher={fetcher}
          />
        ) : null}
      </div>

      <span className="line-clamp-3 break-words">
        {reply.tag ? (
          <Badge
            // to={`#replycard-${reply.tag.replyId}`}
            onClick={(e) => {
              setSearchParams(
                (prev) => {
                  // @ts-expect-error
                  prev.set(`tag`, reply.tag.replyId.toString());
                  return prev;
                },
                { replace: true }
              );
              setTimeout(() => {
                setSearchParams(
                  (prev) => {
                    prev.delete("tag");
                    return prev;
                  },
                  { replace: true }
                );
              }, 800);
            }}
            variant="secondary"
            className="text-blue-600 cursor-pointer mr-1"
          >
            @{reply.tag.username}{" "}
          </Badge>
        ) : null}
        {reply.content}
      </span>
      <div className="flex justify-between items-start relative">
        <LikeButton
          replyId={reply._id.toString()}
          liked={reply.liked}
          fetcher={fetcher}
          likes={reply.likes}
        />
        {user?.username !== reply.user.username ? (
          <ReplyAccordian
            fetcher={fetcher}
            replyId={reply._id.toString()}
            username={reply.user.username}
            replyUser={reply.user._id.toString()}
            parentComment={reply.parentComment.toString()}
          />
        ) : (
          <div className="py-4"></div>
        )}
      </div>
    </div>
  );
};

function ReplyAccordian({
  fetcher,
  replyId,
  username,
  replyUser,
  parentComment,
}: {
  fetcher: FetcherWithComponents<any>;
  replyId: string;
  username: string;
  replyUser: string;
  parentComment: string;
}) {
  const [reply, setReply] = useState("");
  const accRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (
      fetcher.data?.message &&
      fetcher.data?.message !== "tagged" &&
      fetcher.data?.message !== "liked"
    ) {
      accRef.current?.click();
    }
  }, [fetcher.data]);
  return (
    <Accordion
      className="w-full space-y-2"
      type="multiple"
    >
      <AccordionItem
        className="border-none"
        value="replyto"
      >
        <AccordionTrigger
          ref={accRef}
          className="flex justify-end py-1.5 pr-3"
        >
          Reply
        </AccordionTrigger>

        <AccordionContent className="w-full p-2 mt-2 relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setReply("");
              accRef.current?.click();
              fetcher.submit(
                {
                  _action: "tagReply",
                  replyId,
                  username,
                  replyUser,
                  parentComment,
                  reply,
                },
                { action: "replies", method: "POST" }
              );
            }}
          >
            <Badge
              variant="secondary"
              className="absolute top-4 left-4"
            >
              replying to
              <span className="text-blue-600 ml-1">@{username}</span>
            </Badge>
            <Textarea
              name="reply"
              className="w-full pt-8"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              required
              placeholder="Write your reply here..."
            />
            <div className="text-red-600 text-xs">
              {fetcher.data?.message !== "tagged" &&
                fetcher.data?.message !== "liked" &&
                fetcher.data?.message}
            </div>
            <Button
              type="submit"
              className="mt-1"
              size="sm"
              disabled={
                fetcher.state === "submitting" || reply.trim().length === 0
              }
            >
              reply
            </Button>
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function LikeButton({
  likes,
  liked,
  replyId,
  fetcher,
}: {
  likes: number;
  liked: boolean;
  replyId: string;
  fetcher: FetcherWithComponents<any>;
}) {
  const [state, setState] = useState({ likes, liked });

  return (
    <form
      className="absolute top-0 left-0"
      onSubmit={(e) => {
        e.preventDefault();
        setState((prev) => ({
          likes: prev.likes + (liked ? -1 : 1),
          liked: !prev.liked,
        }));
        // console.log(likes);
        fetcher.submit(
          { _action: "likeReply", replyId },
          { action: "replies", method: "POST" }
        );
      }}
    >
      <Button
        type="submit"
        size="sm"
        className="flex gap-2 px-2"
        variant="ghost"
        disabled={fetcher.state === "submitting"}
      >
        <FaRegThumbsUp className={state.liked ? "text-blue-600" : ""} />
        {state.likes}
      </Button>
    </form>
  );
}
function ReplyMenu({
  replyId,
  fetcher,
}: {
  replyId: string;
  fetcher: FetcherWithComponents<any>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-auto mr-2">
        <DotsVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-center">
          Reply Menu
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            disabled={fetcher.state !== "idle"}
            onClick={() =>
              fetcher.submit(
                { _action: "deleteReply", replyId },
                { method: "POST", action: "replies" }
              )
            }
            size="sm"
            variant="destructive"
            className="hover:cursor-pointer w-full"
          >
            Delete Reply
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ReplyCard;

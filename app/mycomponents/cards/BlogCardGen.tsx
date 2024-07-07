import { ChatBubbleIcon, EyeOpenIcon, HeartIcon } from "@radix-ui/react-icons";
import { Link, useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { BlogDoc } from "~/routes/dashboard.blogs._index";
import { formatTime } from "~/utils/general";
import { CardTitle, Card } from "~/components/ui/card";
import TransitionLink from "../TransitionLink";

const GeneralBlogCard = ({
  _id,
  title,
  createdAt,
  likes,
  views,
  thumbnail,
  comments,
}: BlogDoc) => {
  return (
    <Card className="w-full max-w-3xl flex flex-col sm:flex-row justify-start">
      <TransitionLink
        to={`/blogs/${_id}`}
        preventScrollReset
        className="w-full max-h-36 overflow-hidden sm:w-2/6"
      >
        <img
          src={thumbnail}
          width={320}
          height={180}
          alt="Blog Thumbnail"
          className="rounded-t-md sm:rounded-l-md sm:rounded-tr-none object-cover aspect-[2/1] w-full h-full"
        />
      </TransitionLink>
      <div className="p-6 sm:w-2/3 flex items-center justify-between flex-wrap">
        <div className="w-full xs:w-5/6 space-y-4">
          <CardTitle className="break-words line-clamp-2 leading-normal">
            <TransitionLink
              to={`/blogs/${_id}`}
              preventScrollReset
              className="w-full sm:w-1/3"
            >
              {title}
            </TransitionLink>
          </CardTitle>
          <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
            <div
              title={views + " views"}
              className="flex items-center gap-1"
            >
              <EyeOpenIcon className="w-4 h-4" />
              <span>{views ?? 0}</span>
            </div>
            <div
              title={likes + " likes"}
              className="flex items-center gap-1"
            >
              <HeartIcon className="w-4 h-4" />
              <span>{likes ?? 0}</span>
            </div>
            <div
              title={comments + " responses"}
              className="flex items-center gap-1"
            >
              <ChatBubbleIcon className="w-4 h-4" />
              <span>{comments ?? 0}</span>
            </div>
            <div>
              <time dateTime={createdAt}>{formatTime(createdAt)}</time>
            </div>
          </div>
        </div>
        <TransitionLink
          className="mt-4 sm:mt-0"
          to={`/blogs/${_id}`}
          prefetch="intent"
        >
          <Button size="sm">view</Button>
        </TransitionLink>
      </div>
    </Card>
  );
};

export default GeneralBlogCard;

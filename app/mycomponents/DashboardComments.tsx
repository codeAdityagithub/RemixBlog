import {
  AvatarIcon,
  ChevronDownIcon,
  DotFilledIcon,
} from "@radix-ui/react-icons";
import { Link, useFetcher, useLocation } from "@remix-run/react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { CommentDocument, CommentDocumentwUser } from "~/models/Schema.server";
import { formatTime, useUser } from "~/utils/general";
import DeleteButtonwDialog from "./DeleteButtonwDialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type Props = {};
type Card = Omit<
  CommentDocumentwUser,
  "likedBy" | "updatedAt" | "parentComment" | "blogOwner"
>;
const DashboardComments = (props: Props) => {
  const user = useUser()!;
  const location = useLocation();
  const ref = useRef<HTMLHeadingElement>(null);
  if (location.hash.slice(1) === "dashboardComments" && ref.current) {
    ref.current.scrollIntoView();
    ref.current.classList.add("bg-secondary");
    setTimeout(() => {
      ref.current?.classList.remove("bg-secondary");
    }, 1000);
  }
  const {
    data: comments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["dashboardComments"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/comments?page=${pageParam}`, {
        credentials: "same-origin",
      });
      const data = await res.json();
      // console.log(data);
      if (!res.ok) throw new Error("Something went wrong");

      return data?.comments as Card[];
    },
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage?.length === 0 ? null : lastPageParam + 1,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
    maxPages: 3,
  });
  const refetchComments = useCallback(() => {
    refetch();
  }, []);

  return (
    <div
      className="col-span-6 lg:col-span-3 space-y-2 mt-8 rounded-md"
      id="dashboardComments"
    >
      <h2 className="text-2xl font-bold mb-6">Latest Comments</h2>

      <div
        ref={ref}
        className="flex flex-col gap-2 p-2 border rounded-md max-h-[400px] max-w-[600px] overflow-auto ver_scroll"
      >
        {error && error.message}
        {isLoading &&
          [0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              className="w-full h-32"
            />
          ))}
        {!comments ||
          (comments.pages[0]?.length === 0 && "No comments to show.")}
        {comments &&
          comments.pages.length > 0 &&
          comments.pages.flat().map((comment) => (
            <DashboardCommentCard
              key={comment._id.toString()}
              comment={comment}
              user={user}
              refetch={refetchComments}
            />
          ))}
        {comments && comments.pages[0].length > 0 && (
          <Button
            onClick={() => fetchNextPage({ cancelRefetch: false })}
            disabled={isFetchingNextPage || !hasNextPage}
            className="w-full"
            variant="ghost"
          >
            <ChevronDownIcon />
          </Button>
        )}
      </div>
    </div>
  );
};

function DashboardCommentCard({
  comment,
  user,
  refetch,
}: {
  comment: Card;
  user: ReturnType<typeof useUser>;
  refetch: () => void;
}) {
  const fetcher = useFetcher<any>();
  const queryClient = useQueryClient();
  const deleteComment = () => {
    fetcher.submit(
      { commentId: comment._id.toString() },
      {
        method: "DELETE",
        action: `/api/comments`,
      }
    );
  };
  useEffect(() => {
    fetcher.data?.message === "deleted" && refetch();
  }, [fetcher.data]);
  return (
    <div className="w-full p-4 border border-l-border/30 border-r-border/30 rounded-md flex justify-between flex-col sm:flex-row">
      <div className="">
        <div className="flex items-start flex-col">
          <Link
            className="flex items-center flex-wrap"
            to={`/profiles/${comment.user.username}`}
          >
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage
                width={32}
                height={32}
                alt={comment.user.username}
                src={comment.user.picture}
                className=""
              ></AvatarImage>
              <AvatarFallback>
                <AvatarIcon
                  className="w-full h-full"
                  style={{ margin: 0 }}
                />
              </AvatarFallback>
            </Avatar>
            {comment.user.username}
            <span className="text-muted-foreground ml-1">
              {comment.user.username === user?.username && "(You)"}
            </span>
            <span className="text-xs text-muted-foreground">
              <DotFilledIcon className="w-2 h-2 mx-2 inline" />
              {formatTime(comment.createdAt.toString())}
            </span>
          </Link>
        </div>
        <p className="line-clamp-2 break-words p-1 text-foreground/80">
          {comment.content}
        </p>
      </div>
      <div className="flex sm:pb-0 gap-4 items-center justify-end">
        <Link
          to={`/blogs/${comment.blogId.toString()}?comment=${comment._id.toString()}`}
          onClick={(e) => {
            queryClient.setQueryData(["highlightedComment"], comment);
          }}
          className="line-clamp-2 leading-5"
        >
          View
        </Link>
        <DeleteButtonwDialog
          disabled={fetcher.state === "submitting"}
          action={deleteComment}
          label="comment"
        />
      </div>
    </div>
  );
}

export default DashboardComments;

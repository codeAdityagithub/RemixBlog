import { AvatarIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { CommentDocumentwUser } from "~/models/Schema.server";
import { loader } from "~/routes/api.comments";
import { formatTime, useUser } from "~/utils/general";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { useFetcher, Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import DeleteButtonwDialog from "./DeleteButtonwDialog";
import { useCallback, useEffect } from "react";

type Props = {};
type Card = Omit<
    CommentDocumentwUser,
    "likedBy" | "updatedAt" | "parentComment" | "blogOwner"
>;
const DashboardComments = (props: Props) => {
    const user = useUser()!;
    const {
        data: comments,
        isLoading: isLoadingComments,
        error,
        refetch,
    } = useQuery({
        queryKey: ["dashboardComments"],
        queryFn: async () => {
            const res = await fetch("/api/comments", {
                credentials: "same-origin",
            });
            const data = await res.json();
            // console.log(data);
            if (!res.ok) throw new Error("Something went wrong");

            return data?.comments as Card[];
        },
        refetchInterval: 1000 * 60,
        retry: 1,
        staleTime: 1000 * 60,
    });
    const refetchComments = useCallback(() => {
        refetch();
    }, []);

    return (
        <div
            className="col-span-6 md:col-span-3 space-y-2"
            id="dashboardComments"
        >
            <h2 className="text-2xl font-bold">Latest Comments</h2>

            <div className="flex flex-col gap-2 p-2 border rounded-md max-h-[400px] overflow-auto ver_scroll">
                {error && error.message}
                {!comments || (comments.length === 0 && "No comments to show.")}
                {comments &&
                    comments.length > 0 &&
                    comments.map((comment) => (
                        <DashboardCommentCard
                            key={comment._id.toString()}
                            comment={comment}
                            user={user}
                            refetch={refetchComments}
                        />
                    ))}
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
        <Card className="flex w-full justify-between flex-col sm:flex-row relative">
            <CardHeader className="">
                <CardTitle className="text-muted-foreground">
                    {comment.user.username}
                    {comment.user.username === user?.username && " (You)"}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-foreground">
                    {comment.content}
                </CardDescription>
            </CardHeader>
            <span className="text-xs text-muted-foreground absolute right-6 top-2">
                {formatTime(comment.createdAt.toString())}
            </span>
            <CardFooter className="flex sm:pb-0 gap-2 items-center justify-end">
                <Link
                    to={`/blogs/${comment.blogId.toString()}?comment=${comment._id.toString()}`}
                    className="line-clamp-2 leading-5"
                >
                    View
                </Link>
                <DeleteButtonwDialog
                    disabled={fetcher.state === "submitting"}
                    action={deleteComment}
                    label="comment"
                />
            </CardFooter>
        </Card>
    );
}

export default DashboardComments;

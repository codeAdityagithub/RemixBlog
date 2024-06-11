import { useParams } from "@remix-run/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { destructiveToastStyle } from "~/utils/general";

type Props = {
    userId: string;
};
const FollowButton = ({ userId }: Props) => {
    const params = useParams();
    const {
        data: isFollowing,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["follow", params.blogId],
        queryFn: async () => {
            const data = await fetch("/api/follow?userId=" + userId, {
                method: "GET",
                credentials: "same-origin",
            }).then((res) => res.json());

            return data.isFollowing;
        },
        staleTime: 1000 * 60 * 60,
        _optimisticResults: "optimistic",
    });
    const { mutate, isPending } = useMutation({
        mutationFn: async (isFollowing: boolean | string) => {
            const res = await fetch("/api/follow", {
                method: isFollowing ? "DELETE" : "POST",
                body: JSON.stringify({
                    userId,
                    blogId: params.blogId,
                    isFollowing,
                }),
                credentials: "same-origin",
            });
            if (!res.ok)
                throw new Error(
                    res.status === 429
                        ? "Unfollow after 5 mins"
                        : "Something went wrong"
                );
        },
        onSuccess() {
            refetch();
        },
        onError(error) {
            toast.error(error.message, { style: destructiveToastStyle });
        },
    });
    return (
        <Button
            disabled={isLoading || isPending}
            variant="link"
            onClick={() => mutate(isFollowing)}
            className={cn(
                !isFollowing
                    ? "text-green-500 hover:text-green-600"
                    : "text-accent-foreground"
            )}
        >
            {isFollowing ? "Unfollow" : "Follow"}
        </Button>
    );
};
export default FollowButton;

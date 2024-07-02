import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

type Props = {
    revalidate: (data: any) => void;
};

const BlogComments = ({ revalidate }: Props) => {
    const [comment, setComment] = useState("");
    const fetcher = useFetcher<any>();
    useEffect(() => {
        if (fetcher.data?.message === "added") {
            setComment("");
            revalidate(fetcher.data.comment);
        }
        // console.log(fetcher.formData);

        // addComment();
    }, [fetcher.data]);
    return (
        <fetcher.Form className="space-y-2" action="comments" method="POST">
            <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder="What are your thoughts?"
                name="comment"
            />
            <small className="text-red-600">
                {fetcher.data?.message !== "added" && fetcher.data?.message}
            </small>
            <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={
                    fetcher.state === "submitting" || comment.length === 0
                }
            >
                {fetcher.state === "submitting" ? "sending" : "send"}
            </Button>
        </fetcher.Form>
    );
};

export default BlogComments;

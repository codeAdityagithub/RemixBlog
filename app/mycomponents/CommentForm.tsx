import { useFetcher, useParams } from "@remix-run/react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { CommentDocumentwUser } from "~/models/Schema.server";

type Props = {
    revalidate: () => void;
};

const BlogComments = ({ revalidate }: Props) => {
    const [comment, setComment] = useState("");
    const fetcher = useFetcher<any>();
    useEffect(() => {
        setComment("");
        if (fetcher.data?.message === "added") revalidate();
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

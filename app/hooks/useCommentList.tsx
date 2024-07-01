import { useSearchParams } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { CommentDoc } from "~/mycomponents/BlogCommentsSheet";

type Props = {
    initialComments: CommentDoc[];
    revalidate: () => void;
};
const useCommentList = ({ initialComments }: Props) => {
    const [comments, setComments] = useState(initialComments);
    const [sorting, setSorting] = useState("mostRelevant");
    const commentHighlight = useSearchParams()[0].get("comment");
    const queryClient = useQueryClient();
    const isFetching = useRef(false);
    useEffect(() => {
        handleSort(sorting);
    }, [sorting, comments, initialComments]);

    useEffect(() => {
        if (
            commentHighlight &&
            !comments.some(
                // @ts-expect-error
                (comment) => comment._id === commentHighlight
            )
        ) {
            const comment = queryClient.getQueryData([
                "highlightedComment",
            ]) as CommentDoc;
            if (comment) {
                setComments((prev) => [comment, ...prev]);
            } else {
                if (!isFetching.current) {
                    isFetching.current = true;

                    fetch("/api/comments?commentId=" + commentHighlight, {
                        credentials: "same-origin",
                    }).then(async (res) => {
                        const data = await res.json();
                        if (data?.comment) {
                            setComments((prev) => [data.comment, ...prev]);
                        }
                        setTimeout(() => {
                            isFetching.current = false;
                        }, 200);
                    });
                }
            }
        }
    }, [commentHighlight, queryClient, comments]);

    function handleSort(value: string) {
        // const sortedComments = [...initialComments].sort((a, b) => {
        //     if (value === "mostRelevant") {
        //         return b.likes - a.likes;
        //     } else {
        //         return (
        //             new Date(b.createdAt).getTime() -
        //             new Date(a.createdAt).getTime()
        //         );
        //     }
        // });
        // setComments(sortedComments);
        setComments((prev) =>
            [...prev].sort((a, b) => {
                if (value === "mostRelevant") {
                    return b.likes - a.likes;
                } else {
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                }
            })
        );
    }
    return [comments, setSorting, handleSort] as const;
};
export default useCommentList;

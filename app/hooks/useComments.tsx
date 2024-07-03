import { useFetcher, useParams, useSearchParams } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommentDoc } from "../mycomponents/BlogCommentsSheet";

const useComments = ({ enabled }: { enabled: boolean }) => {
  const [comments, setComments] = useState({
    likes: { comments: [] as CommentDoc[], cursor: "", hasMore: false },
    createdAt: { comments: [] as CommentDoc[], cursor: "", hasMore: false },
  });
  const commentHighlight = useSearchParams()[0].get("comment");
  const isFetching = useRef(false);
  const [sortBy, setSortBy] = useState<"likes" | "createdAt">("likes");
  const blogId = useParams().blogId;
  const fetcher = useFetcher<any>();
  // const fetcher2 = useFetcher<any>({ key: ${blogId}-createdAt });
  const queryClient = useQueryClient();
  useEffect(() => {
    if (fetcher.data) {
      setComments((prev) => ({
        ...prev,
        [sortBy]: {
          comments: [...prev[sortBy].comments, ...fetcher.data.comments],
          cursor: fetcher.data.cursor,
          hasMore: fetcher.data.hasMore,
        },
      }));
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (
      commentHighlight &&
      comments[sortBy].cursor !== "" &&
      !comments[sortBy].comments.some(
        (comment) => comment._id === commentHighlight
      )
    ) {
      const comment = queryClient.getQueryData(["highlightedComment"]) as
        | CommentDoc
        | undefined;
      if (comment) {
        addComment(comment);
      } else {
        if (!isFetching.current) {
          isFetching.current = true;
          fetch("/api/comments?commentId=" + commentHighlight).then(
            async (res) => {
              if (!res.ok) return;
              const data = await res.json();
              if (data?.comment) {
                addComment(data.comment);
              }
              setTimeout(() => (isFetching.current = false), 100);
            }
          );
        }
      }
    }
  }, [commentHighlight, queryClient, comments]);

  useEffect(() => {
    if (enabled && comments[sortBy].cursor === "") {
      fetchComments();
    }
  }, [sortBy, enabled, comments]);

  const fetchComments = useCallback(() => {
    if (fetcher.state === "idle")
      fetcher.load(
        `/blogs/${blogId}/comments?sortBy=${sortBy}&cursor=${comments[sortBy].cursor}`
      );
  }, [fetcher, blogId, sortBy, comments]);
  const updateCommentsLiked = useCallback(
    (commentId: string) => {
      setComments((prev) => {
        let updatedComments = prev[sortBy].comments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                liked: !comment.liked,
                likes: comment.likes + (comment.liked ? -1 : 1),
              }
            : comment
        );

        return {
          likes: {
            ...prev.likes,
            comments:
              sortBy === "likes"
                ? updatedComments.sort((a, b) => b.likes - a.likes)
                : [...prev.likes.comments],
          },
          createdAt: {
            ...prev.createdAt,
            comments:
              sortBy === "createdAt"
                ? updatedComments
                : [...prev.createdAt.comments],
          },
        };
      });
    },
    [comments, sortBy]
  );
  const deleteComment = useCallback(
    (commentId: string) => {
      setComments((prev) => {
        console.log(prev);
        let updatedComments = prev[sortBy].comments.filter(
          (comment) => comment._id !== commentId
        );
        return {
          likes: {
            ...prev.likes,
            comments:
              sortBy === "likes"
                ? updatedComments.sort((a, b) => b.likes - a.likes)
                : [...prev.likes.comments],
          },
          createdAt: {
            ...prev.createdAt,
            comments:
              sortBy === "createdAt"
                ? updatedComments
                : [...prev.createdAt.comments],
          },
        };
      });
    },
    [comments, sortBy]
  );
  const addComment = useCallback(
    (comment: CommentDoc) => {
      setComments((prev) => {
        return {
          likes: {
            ...prev.likes,
            comments: [comment, ...prev.likes.comments],
          },
          createdAt: {
            ...prev.createdAt,
            comments: [comment, ...prev.createdAt.comments],
          },
        };
      });
    },
    [comments]
  );

  return {
    comments: comments[sortBy].comments,
    fetchComments,
    updateCommentsLiked,
    deleteComment,
    setSortBy,
    sortBy,
    hasMore: comments[sortBy].hasMore,
    isLoading: fetcher.state === "loading",
    addComment,
  };
};

export default useComments;

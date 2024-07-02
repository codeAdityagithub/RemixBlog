import type { CommentDoc } from "./BlogCommentsSheet";
import CommentCard from "./cards/CommentCard";
type Props = {
    comments: CommentDoc[];
    revalidate: (data: any) => void;
};

const CommentList = ({ comments, revalidate }: Props) => {
    // const [comments, setSorting, handleSort] = useCommentList({
    //     initialComments,
    //     revalidate,
    // });

    return (
        <div className="flex flex-col gap-2">
            {comments &&
                (comments.length === 0 ? (
                    <p className="p-2 text-muted-foreground">
                        There are no responses
                    </p>
                ) : (
                    comments.map((comment) => (
                        <CommentCard
                            key={comment._id.toString()}
                            comment={comment}
                            revalidate={revalidate}
                        />
                    ))
                ))}
        </div>
    );
};

export default CommentList;

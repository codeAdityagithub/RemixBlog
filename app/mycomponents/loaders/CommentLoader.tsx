import React from "react";
import { Skeleton } from "~/components/ui/skeleton";

type Props = {};

const CommentLoader = (props: Props) => {
    return (
        <div className="p-1 border border-border rounded-md w-full space-y-3">
            <div className="flex w-full flex-row items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-col w-full gap-2">
                    <Skeleton className="h-2 w-1/3" />
                    <Skeleton className="h-2 w-1/4" />
                </div>
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-5/6" />

            <div className="flex justify-between items-start relative gap-4">
                <Skeleton className="rounded-md w-12 h-8" />
                <Skeleton className="rounded-md w-full h-8" />
            </div>
        </div>
    );
};

export default CommentLoader;

import React from "react";
import { Skeleton } from "~/components/ui/skeleton";

type Props = {};

const EngagementLoader = (props: Props) => {
    return (
        <div className="flex justify-between w-full">
            <div className="flex items-center justify-evenly gap-4">
                <Skeleton className="w-10 h-8 rounded-lg" />
                <Skeleton className="w-10 h-8 rounded-lg" />
                <Skeleton className="w-10 h-8 rounded-lg" />
            </div>
            <div className="flex items-center justify-evenly gap-4">
                <Skeleton className="w-10 h-8 rounded-lg" />
                <Skeleton className="w-10 h-8 rounded-lg" />
            </div>
        </div>
    );
};

export default EngagementLoader;

import {
    CardTitle,
    CardDescription,
    CardContent,
    Card,
} from "~/components/ui/card";
import { AvatarImage, AvatarFallback, Avatar } from "~/components/ui/avatar";
import { Link } from "@remix-run/react";
import { Skeleton } from "~/components/ui/skeleton";

type Props = {};

const BlogSkeletonsm = (props: Props) => {
    return (
        <Card className="w-full sm:max-w-md">
            <Skeleton className="w-full aspect-video" />
            <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="w-full p-3 mb-2"></Skeleton>
                    <Skeleton className="w-9/12 p-2 mb-2"></Skeleton>
                </div>
                <div className="flex items-end justify-between gap-4">
                    <div className="flex items-center space-x-2 flex-1">
                        <Skeleton className="w-10 h-10 rounded-full"></Skeleton>
                        <div className="flex-[2]">
                            <Skeleton className="w-3/5 p-2 mb-2"></Skeleton>
                            <Skeleton className="w-full p-2"></Skeleton>
                        </div>
                    </div>
                    <Skeleton className="flex-[1] p-2"></Skeleton>
                </div>
            </CardContent>
        </Card>
    );
};

export default BlogSkeletonsm;

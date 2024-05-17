import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type Props = {};

const BlogSkeletonlg = (props: Props) => {
    return (
        <Card>
            <Skeleton className="w-full aspect-[3/1]" />
            <CardContent className="p-6">
                <Skeleton className="w-full p-4 mb-2"></Skeleton>
                <Skeleton className="w-7/12 h-12"></Skeleton>
            </CardContent>
        </Card>
    );
};

export default BlogSkeletonlg;

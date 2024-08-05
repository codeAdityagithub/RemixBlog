import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type Props = {};

const BlogSkeletonlg = (props: Props) => {
  return (
    <Card className="w-full">
      <Skeleton className="w-full h-[390px]" />
      <CardContent className="p-6 relative">
        <Skeleton className="w-full p-4 mb-2"></Skeleton>
        <Skeleton className="w-7/12 h-12"></Skeleton>
      <Skeleton className="absolute right-6 top-1/2 w-24 h-12"></Skeleton>
      </CardContent>
    </Card>
  );
};

export default BlogSkeletonlg;

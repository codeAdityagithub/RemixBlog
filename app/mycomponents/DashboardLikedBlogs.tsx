import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { BlogDoc } from "~/routes/api.topBlogs";
import { useUser } from "~/utils/general";
import TopPerformingCard from "./cards/TopPerformingCard";
import GeneralBlogCard from "./cards/BlogCardGen";
import { Skeleton } from "~/components/ui/skeleton";

type Props = {};
const LikedBlogs = (props: Props) => {
  const user = useUser();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["MyLikedBlogs", user?._id],
    queryFn: async () => {
      const res = await fetch(`/api/likedBlogs`);
      const data = await res.json();
      return data.likedBlogs;
    },
    staleTime: 1000 * 60 * 60,
  });
  return (
    <div
      className="col-span-6 lg:col-span-3 space-y-2 mt-8"
      id="dashboardComments"
    >
      <h2 className="text-2xl font-bold mb-6">Blogs You Liked</h2>
      <div className="flex flex-col gap-4 p-2 border rounded-md h-[400px] max-h-[400px] max-w-[600px] overflow-auto ver_scroll">
        {isLoading &&
          [0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="w-full h-32"
            />
          ))}
        {!data ||
          (data.length === 0 && (
            <h2 className="text-lg font-semibold">
              You haven't liked any blogs
            </h2>
          ))}
        {!isLoading &&
          data &&
          data.map((blog: any) => (
            <GeneralBlogCard
              key={blog.blogId._id}
              {...blog.blogId}
            />
          ))}
      </div>
    </div>
  );
};
export default LikedBlogs;

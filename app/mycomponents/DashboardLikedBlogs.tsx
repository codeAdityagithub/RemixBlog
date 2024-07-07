import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { BlogDoc } from "~/routes/api.topBlogs";
import { useUser } from "~/utils/general";
import TopPerformingCard from "./cards/TopPerformingCard";
import GeneralBlogCard from "./cards/BlogCardGen";

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
      <h2 className="text-2xl font-bold mb-6">Blogs I Liked</h2>
      <div className="flex flex-col gap-4 p-2 border rounded-md h-[400px] max-h-[400px] max-w-[600px] overflow-auto ver_scroll">
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

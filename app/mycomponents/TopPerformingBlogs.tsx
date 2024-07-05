import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { BlogDoc } from "~/routes/api.topBlogs";
import { useUser } from "~/utils/general";
import TopPerformingCard from "./cards/TopPerformingCard";

type Props = {};
const TopPerformingBlogs = (props: Props) => {
  const user = useUser();
  const [ref, isInview] = useInView({ triggerOnce: true });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["TopPerformingBlogs", user?._id],
    queryFn: async () => {
      const res = await fetch(`/api/topBlogs`);
      const data = await res.json();

      return data.blogs as BlogDoc[];
    },
    staleTime: 1000 * 60 * 60,
    enabled: isInview,
  });
  // console.log(data);
  return (
    <div
      ref={ref}
      className="col-span-6 lg:col-span-3 space-y-2 mt-8"
      id="dashboardComments"
    >
      <h2 className="text-2xl font-bold mb-6">Top Performing Blogs</h2>
      <div className="flex flex-col gap-2 p-2 border rounded-md h-[400px] max-h-[400px] max-w-[600px] overflow-auto ver_scroll">
        {!isLoading &&
          data &&
          data.map((blog) => (
            <TopPerformingCard
              key={blog._id}
              {...blog}
            />
          ))}
      </div>
    </div>
  );
};
export default TopPerformingBlogs;

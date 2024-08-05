import BlogSkeletonlg from "../cards/BlogSkeletonlg";
import BlogSkeletonsm from "../cards/BlogSkeletonsm";

type Props = {};

const AllBlogsLoader = (props: Props) => {
  return (
    <>
      <div className="col-span-5 lg:col-span-3 space-y-2">
        <h2 className="col-span-full font-semibold text-3xl mb-6">
          <span className="text-4xl font-black mr-2">|</span>
          Popular Blogs
        </h2>
        <BlogSkeletonlg />
      </div>
      <div className="col-span-5 lg:col-span-2 flex flex-col gap-2 lg:h-[600px] lg:pb-6 pt-2">
        <h2 className="col-span-full font-semibold text-3xl mb-4">
          <span className="text-4xl font-black mr-2">|</span>
          Trending Blogs
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] lg:px-4 gap-4 h-full overflow-auto ver_scroll">
          {Array.from({ length: 6 }).map((_, ind) => (
            <BlogSkeletonsm key={`blogskel${ind}`} />
          ))}
        </div>
      </div>
      <div className="col-span-5 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 pt-2">
        <h2 className="col-span-full font-semibold text-3xl mb-6">
          <span className="text-4xl font-black mr-2">|</span>
          Latest Blogs
        </h2>
        {Array.from({ length: 6 }).map((_, ind) => (
          <BlogSkeletonsm key={`blogskel${ind}`} />
        ))}
      </div>
    </>
  );
};

export default AllBlogsLoader;

import BlogSkeletonlg from "../cards/BlogSkeletonlg";
import BlogSkeletonsm from "../cards/BlogSkeletonsm";

type Props = {};

const AllBlogsLoader = (props: Props) => {
    return (
        <div className="flex flex-col gap-4">
            <BlogSkeletonlg />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                {Array.from({ length: 3 }).map((_, ind) => (
                    <BlogSkeletonsm key={`blogskel${ind}`} />
                ))}
            </div>
        </div>
    );
};

export default AllBlogsLoader;

import { Await, defer, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { connect } from "~/db.server";
import { Blogs } from "~/models/Schema.server";
import AllBlogsLoader from "~/mycomponents/AllBlogsLoader";
import BlogCardLarge from "~/mycomponents/cards/BlogCardLarge";
import BlogCardSmall from "~/mycomponents/cards/BlogCardSmall";
import BlogSkeletonlg from "~/mycomponents/cards/BlogSkeletonlg";

export const loader = async ({}) => {
    await connect();

    const blogs = Blogs.find(
        {},
        { _id: 1, author: 1, updatedAt: 1, desc: 1, thumbnail: 1, title: 1 }
    )
        .populate("author", { username: 1, _id: 0 })
        .lean()
        .exec();
    return defer({ blogs }, { headers: { "Cache-Control": "max-age=3600" } });
};

const AllBlogs = () => {
    const { blogs } = useLoaderData<typeof loader>();
    // console.log(blogs);
    return (
        <div className="container">
            <Suspense fallback={<AllBlogsLoader />}>
                <Await resolve={blogs}>
                    {(blogs) => (
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                            {blogs.map((blog) => (
                                <BlogCardSmall
                                    _id={blog._id}
                                    // @ts-expect-error
                                    author={blog.author}
                                    desc={blog.desc}
                                    thumbnail={blog.thumbnail}
                                    title={blog.title}
                                    updatedAt={blog.updatedAt}
                                />
                            ))}
                        </div>
                    )}
                </Await>
            </Suspense>
        </div>
    );
};

export default AllBlogs;

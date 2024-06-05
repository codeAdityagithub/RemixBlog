import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Types } from "mongoose";
import { authenticator } from "~/auth.server";
import { TypographyH1, TypographyP } from "~/components/Typography";
import { Button } from "~/components/ui/button";
import { connect } from "~/db.server";
import { BlogDocument, Blogs } from "~/models/Schema.server";
import DashboardBlogCard from "~/mycomponents/DashboardBlogCard";
import DashboardPagination from "~/mycomponents/DashboardPagination";
import serverCache from "~/utils/cache.server";

type BlogDoc = Pick<BlogDocument, "_id" | "desc" | "title" | "updatedAt">;

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    await connect();
    const page = parseInt(new URL(request.url).searchParams.get("page") ?? "1");
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    if (!serverCache.has(`ttl${user._id}`)) {
        // console.log("cache miss");
        const result = await Blogs.aggregate([
            { $match: { author: new Types.ObjectId(user._id) } },
            {
                $facet: {
                    totalBlogs: [{ $count: "count" }],
                    blogs: [
                        { $sort: { updatedAt: -1 } },
                        { $skip: skip },
                        { $limit: pageSize },
                        {
                            $project: {
                                _id: 1,
                                desc: 1,
                                title: 1,
                                updatedAt: 1,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    totalBlogs: { $arrayElemAt: ["$totalBlogs.count", 0] },
                },
            },
        ]);
        serverCache.set(`ttl${user._id}`, result[0].totalBlogs);
        return {
            blogs: result[0].blogs as BlogDoc[],
            totalBlogs: result[0].totalBlogs as number,
        };
    } else {
        // console.log("cache hit");
        const blogs = (await Blogs.find(
            { author: user._id },
            {
                _id: 1,
                desc: 1,
                title: 1,
                updatedAt: 1,
            },
            { lean: true, skip, limit: pageSize }
        ).sort({ updatedAt: -1 })) as BlogDoc[];
        return {
            blogs,
            totalBlogs: serverCache.get(`ttl${user._id}`) as number,
        };
    }
};

const DashboardBlogs = () => {
    const { blogs, totalBlogs } = useLoaderData<typeof loader>();
    // console.log(totalBlogs);
    return (
        <div className="h-full flex flex-col">
            <div className="w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] overflow-auto ver_scroll flex-1 flex flex-col items-center gap-4">
                {blogs.map((blog, ind) => (
                    <DashboardBlogCard
                        key={blog._id?.toString()}
                        title={blog.title}
                        _id={blog._id.toString()}
                        desc={blog.desc}
                        updatedAt={blog.updatedAt}
                    />
                ))}
                {blogs.length === 0 ? (
                    <div className="flex h-full gap-6 flex-col items-center justify-center">
                        <TypographyH1>No Blogs</TypographyH1>
                        <div className="text-muted-foreground flex flex-col items-center gap-1">
                            <TypographyP>Create a new one</TypographyP>
                            <Link to="/dashboard/new">
                                <Button>Create Now</Button>
                            </Link>
                        </div>
                    </div>
                ) : null}
            </div>
            <DashboardPagination totalBlogs={totalBlogs} />
        </div>
    );
};

export default DashboardBlogs;

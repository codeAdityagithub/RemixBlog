import { ChatBubbleIcon, HeartIcon } from "@radix-ui/react-icons";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
    ClientLoaderFunctionArgs,
    Link,
    useLoaderData,
} from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { TypographyH1, TypographyP } from "~/components/Typography";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { connect } from "~/db.server";
import { BlogDocument, Blogs } from "~/models/Schema.server";
import DashboardAllblogFilter from "~/mycomponents/DashboardAllblogFilter";
import DashboardBlogCard from "~/mycomponents/cards/DashboardBlogCard";
import DashboardPagination from "~/mycomponents/DashboardPagination";
import { formatTime } from "~/utils/general";
import { cacheDashboardBlogs } from "~/utils/localStorageCache.client";

export type BlogDoc = Pick<
    BlogDocument,
    "desc" | "title" | "likes" | "thumbnail" | "views" | "comments"
> & { _id: string; createdAt: string };
export const meta: MetaFunction = () => {
    return [
        { title: "RemixBlog | Your Blogs" },
        {
            name: "description",
            content: "Manage all your blogs that you have uploaded",
        },
    ];
};

export const clientLoader = ({ request }: ClientLoaderFunctionArgs) =>
    cacheDashboardBlogs({
        request,
    });

export const HydrateFallback = () => {
    return (
        <div className="h-full flex flex-col items-center">
            <div className="w-[280px] xs:w-[calc(100vw-64px)] max-w-[500px] md:max-w-[600px] overflow-auto ver_scroll flex-1 flex flex-col items-center gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-full border flex flex-col sm:flex-row gap-4 p-6 rounded-lg"
                    >
                        <div className="flex flex-col items-start gap-3 flex-1">
                            <Skeleton className="w-full h-6" />
                            <Skeleton className="w-3/5 h-4" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Skeleton className="h-9 w-20 rounded-lg" />
                            <Skeleton className="h-9 w-20 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DashboardBlogs = () => {
    const { blogs, totalBlogs } = useLoaderData<{
        blogs: BlogDoc[];
        totalBlogs: number;
    }>();
    return (
        <div className="h-full flex flex-col items-center">
            {/* <DashboardAllblogFilter /> */}
            <div className="w-[280px] xs:w-[calc(100vw-64px)] max-w-[500px] md:max-w-[600px]  p-3 overflow-auto ver_scroll flex-1 flex flex-col items-center gap-4">
                {blogs.map((blog, ind) => (
                    <DashboardBlogCard key={blog._id?.toString()} {...blog} />
                ))}
                {totalBlogs === 0 ? (
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
            {totalBlogs > 10 ? (
                <DashboardPagination totalBlogs={totalBlogs} />
            ) : null}
        </div>
    );
};

export default DashboardBlogs;

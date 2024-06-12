import { LoaderFunctionArgs } from "@remix-run/node";
import {
    ClientLoaderFunctionArgs,
    Link,
    useLoaderData,
} from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { TypographyH1, TypographyP } from "~/components/Typography";
import { Button } from "~/components/ui/button";
import { connect } from "~/db.server";
import { BlogDocument, Blogs } from "~/models/Schema.server";
import DashboardBlogCard from "~/mycomponents/DashboardBlogCard";
import DashboardPagination from "~/mycomponents/DashboardPagination";
import { cacheDashboardBlogs } from "~/utils/localStorageCache.client";

type BlogDoc = Pick<BlogDocument, "_id" | "desc" | "title" | "updatedAt">;

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    await connect();
    const blogs = (await Blogs.find(
        { author: user._id },
        {
            _id: 1,
            desc: 1,
            title: 1,
            updatedAt: 1,
        }
    )
        .sort({ updatedAt: -1 })
        .lean()) as BlogDoc[];
    return { blogs };
};

export const clientLoader = ({
    request,
    serverLoader,
}: ClientLoaderFunctionArgs) =>
    cacheDashboardBlogs({
        request,
        serverLoader,
    });
clientLoader.hydrate = true;
const DashboardBlogs = () => {
    const { blogs, totalBlogs } = useLoaderData<{
        blogs: BlogDoc[];
        totalBlogs: number;
    }>();
    return (
        <div className="h-full flex flex-col items-center">
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
            {blogs.length !== 0 ? (
                <DashboardPagination totalBlogs={totalBlogs} />
            ) : null}
        </div>
    );
};

export default DashboardBlogs;

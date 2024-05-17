import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import React from "react";
import { authenticator } from "~/auth.server";
import { TypographyH1, TypographyP } from "~/components/Typography";
import { Button } from "~/components/ui/button";
import { connect } from "~/db.server";
import { BlogDocument, Blogs } from "~/models/Schema.server";
import DashboardBlogCard from "~/mycomponents/DashboardBlogCard";

type BlogDoc = Pick<BlogDocument, "_id" | "desc" | "title" | "updatedAt">;

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    await connect();
    const blogs = (await Blogs.find(
        { author: user._id },
        { _id: 1, desc: 1, title: 1, updatedAt: 1 }
    )) as BlogDoc[];
    // console.log(typeof blogs[0].updatedAt);
    return { blogs };
};

const DashboardBlogs = () => {
    const blogs = useLoaderData<typeof loader>().blogs;
    return (
        <div className="w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-full flex flex-col gap-4">
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
    );
};

export default DashboardBlogs;

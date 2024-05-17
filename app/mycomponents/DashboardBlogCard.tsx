import { Link, useFetcher } from "@remix-run/react";
import { ObjectId } from "mongoose";
import React from "react";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { BlogDocument } from "~/models/Schema.server";
import { formatTime } from "~/utils/general";
import DeleteButtonwDialog from "./DeleteButtonwDialog";

type Props = {
    _id: string;
    title: string;
    desc: string;
    updatedAt: string;
};

const DashboardBlogCard = ({ _id, title, desc, updatedAt }: Props) => {
    const fetcher = useFetcher();
    const deleteBlog = () => {
        fetcher.submit(null, {
            method: "DELETE",
            action: `/dashboard/blogs/${_id}`,
        });
    };
    return (
        <Card className="flex justify-between">
            <CardHeader className="flex-[2]">
                <CardTitle>
                    <Link to={`/blogs/${_id}`}>{title}</Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                    {desc}
                </CardDescription>
            </CardHeader>
            <CardFooter className="pb-0 flex-1 flex gap-2 relative items-center justify-end">
                <span className="text-xs text-muted-foreground absolute right-6 top-2">
                    {formatTime(updatedAt)}
                </span>
                <Link to={`/dashboard/blogs/${_id}`} prefetch="intent">
                    Edit
                </Link>
                <DeleteButtonwDialog
                    disabled={fetcher.state === "submitting"}
                    action={deleteBlog}
                />
            </CardFooter>
        </Card>
    );
};

export default DashboardBlogCard;

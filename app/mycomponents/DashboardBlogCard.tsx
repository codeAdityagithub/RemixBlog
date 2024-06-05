import { Link, useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
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
        <Card className="flex w-full justify-between flex-col max-w-lg sm:flex-row relative">
            <CardHeader className="">
                <CardTitle>
                    <Link
                        to={`/blogs/${_id}`}
                        className="leading-5 line-clamp-2"
                    >
                        {title}
                    </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                    {desc}
                </CardDescription>
            </CardHeader>
            <span className="text-xs text-muted-foreground absolute right-6 top-2">
                {formatTime(updatedAt)}
            </span>
            <CardFooter className="flex sm:pb-0 gap-2 items-center justify-end">
                <Link to={`/dashboard/blogs/${_id}`} prefetch="intent">
                    <Button variant="link">Edit</Button>
                </Link>
                <DeleteButtonwDialog
                    disabled={fetcher.state === "submitting"}
                    action={deleteBlog}
                    label="blog"
                />
            </CardFooter>
        </Card>
    );
};

export default DashboardBlogCard;

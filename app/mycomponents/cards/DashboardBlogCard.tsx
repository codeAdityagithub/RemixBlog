import { ChatBubbleIcon, EyeOpenIcon, HeartIcon } from "@radix-ui/react-icons";
import { Link, useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { BlogDoc } from "~/routes/dashboard.blogs._index";
import { formatTime } from "~/utils/general";
import DeleteButtonwDialog from "../DeleteButtonwDialog";
import { CardTitle, Card, CardFooter } from "~/components/ui/card";

const DashboardBlogCard = ({
    _id,
    title,
    createdAt,
    likes,
    views,
    thumbnail,
    comments,
}: BlogDoc) => {
    const fetcher = useFetcher();
    const deleteBlog = () => {
        fetcher.submit(null, {
            method: "DELETE",
            action: `/dashboard/blogs/${_id}`,
        });
    };
    return (
        <Card className="w-full max-w-3xl flex flex-col md:flex-row justify-between">
            <Link
                to={`/blogs/${_id}`}
                preventScrollReset
                className="w-full md:w-1/3"
            >
                <img
                    src={thumbnail}
                    width={320}
                    height={180}
                    alt="Blog Thumbnail"
                    className="rounded-t-md md:rounded-l-md md:rounded-tr-none object-cover aspect-[2/1] w-full h-full"
                />
            </Link>
            <div className="px-6 py-3 pb-0 md:pb-3 space-y-2 md:w-1/3">
                <CardTitle className="break-words line-clamp-2 leading-normal">
                    <Link
                        to={`/blogs/${_id}`}
                        preventScrollReset
                        className="w-full md:w-1/3"
                    >
                        {title}
                    </Link>
                </CardTitle>
                <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <EyeOpenIcon className="w-4 h-4" />
                        <span>{views ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <HeartIcon className="w-4 h-4" />
                        <span>{likes ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ChatBubbleIcon className="w-4 h-4" />
                        <span>{comments ?? 0}</span>
                    </div>
                    <div>
                        <time dateTime={createdAt}>
                            {formatTime(createdAt)}
                        </time>
                    </div>
                </div>
            </div>
            <CardFooter className="flex justify-end gap-2 p-4">
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

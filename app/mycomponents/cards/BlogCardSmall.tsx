import {
    CardTitle,
    CardDescription,
    CardContent,
    Card,
} from "~/components/ui/card";
import { AvatarImage, AvatarFallback, Avatar } from "~/components/ui/avatar";
import { Link, useSearchParams } from "@remix-run/react";
import { Skeleton } from "~/components/ui/skeleton";
import { BlogDocumentwUser } from "~/models/Schema.server";
import { formatTime } from "~/utils/general";
import { BlogDocumentwPic } from "~/models/modelCache.server";
import { AvatarIcon } from "@radix-ui/react-icons";
import { Badge } from "~/components/ui/badge";

const BlogCardSmall = ({
    _id,
    author,
    desc,
    thumbnail,
    title,
    createdAt,
    tags,
}: BlogDocumentwPic) => {
    // console.log(tags);
    const setParams = useSearchParams()[1];
    const searchTag = (tag: string) => {
        setParams((prev) => {
            prev.set("searchTag", tag);
            return prev;
        });
    };
    return (
        <Card className="w-full max-w-md h-min">
            <img
                alt="Blog Post Image"
                loading="lazy"
                className="w-full h-48 object-cover rounded-t-lg"
                height={360}
                src={thumbnail}
                style={{
                    aspectRatio: "640/360",
                    objectFit: "cover",
                }}
                width={640}
            />
            <CardContent className="p-6 space-y-4">
                <Link
                    prefetch="intent"
                    className="space-y-2"
                    to={`/blogs/${_id}`}
                >
                    <CardTitle className="text-2xl font-bold line-clamp-2">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground line-clamp-2">
                        {desc}
                    </CardDescription>
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Link
                            prefetch="intent"
                            to={`/profiles/${author.username}`}
                        >
                            <Avatar>
                                <AvatarImage
                                    alt="Author Avatar"
                                    src={author.picture}
                                />
                                <AvatarFallback>
                                    <AvatarIcon className="w-full h-full" />
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="text-sm text-muted-foreground">
                            <p>{author.username}</p>
                            <p>{formatTime(createdAt.toString())}</p>
                        </div>
                    </div>
                    <Link
                        className="px-3 py-2 text-primary hover:underline hover:underline-offset-2"
                        to={`/blogs/${_id}`}
                    >
                        Read more
                    </Link>
                </div>
                <div className="flex gap-2 items-start justify-normal flex-wrap line-clamp-1">
                    {tags?.map((tag, i) => {
                        let isElip = tag.length > 8;
                        return (
                            <Badge
                                aria-label={"Blog tag" + tag}
                                variant="outline"
                                title={"search " + tag}
                                key={i + tag}
                                onClick={() => searchTag(tag)}
                                className="cursor-pointer"
                            >
                                #{tag.substring(0, Math.min(8, tag.length))}
                                {isElip && "..."}
                            </Badge>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default BlogCardSmall;

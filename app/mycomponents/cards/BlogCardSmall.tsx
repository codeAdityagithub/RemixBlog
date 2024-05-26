import {
    CardTitle,
    CardDescription,
    CardContent,
    Card,
} from "~/components/ui/card";
import { AvatarImage, AvatarFallback, Avatar } from "~/components/ui/avatar";
import { Link } from "@remix-run/react";
import { Skeleton } from "~/components/ui/skeleton";
import { BlogDocumentwUser } from "~/models/Schema.server";
import { formatTime } from "~/utils/general";

const BlogCardSmall = ({
    _id,
    author,
    desc,
    thumbnail,
    title,
    updatedAt,
}: Omit<BlogDocumentwUser, "content" | "createdAt">) => {
    return (
        <Card className="w-full max-w-md h-min">
            <img
                alt="Blog Post Image"
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
                <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold line-clamp-2">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground line-clamp-2">
                        {desc}
                    </CardDescription>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Avatar>
                            <AvatarImage
                                alt="Author Avatar"
                                src="/placeholder-avatar.jpg"
                            />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p>{author.username}</p>
                            <p>{formatTime(updatedAt.toString())}</p>
                        </div>
                    </div>
                    <Link
                        className="text-primary hover:underline hover:underline-offset-2"
                        to={`/blogs/${_id}`}
                    >
                        Read more
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

export default BlogCardSmall;

import { Link, useSearchParams } from "@remix-run/react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { BlogDocumentwUser } from "~/models/Schema.server";

const BlogCardLarge = ({
    _id,
    desc,
    thumbnail,
    title,
    tags,
}: Pick<
    BlogDocumentwUser,
    "_id" | "desc" | "thumbnail" | "title" | "tags"
>) => {
    const setParams = useSearchParams()[1];
    const searchTag = (tag: string) => {
        setParams((prev) => {
            prev.set("searchTag", tag);
            return prev;
        });
    };
    return (
        <Card>
            <img
                alt="Blog Post Image"
                className="w-full h-[300px] md:h-[400px] object-cover rounded-t-lg"
                height={600}
                src={thumbnail}
                style={{
                    aspectRatio: "1200/600",
                    objectFit: "cover",
                }}
                width={1200}
            />
            <CardContent className="p-6 grid grid-cols-4 gap-2">
                <div className="col-span-4 sm:col-span-3">
                    <h2 className="text-2xl font-bold mb-2 line-clamp-1">
                        {title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed line-clamp-1">
                        {desc}
                    </p>
                </div>
                <Link
                    className="col-span-4 sm:col-span-1 flex items-center justify-end"
                    to={`/blogs/${_id}`}
                    prefetch="intent"
                >
                    <Button>Read More</Button>
                </Link>
                <div className="col-span-4 flex gap-2 items-start justify-start flex-wrap">
                    {tags?.map((tag, i) => {
                        let isElip = tag.length > 8;
                        return (
                            <Badge
                                aria-label={"Blog tag" + tag}
                                variant="outline"
                                title={"search " + tag}
                                key={i + tag}
                                className="cursor-pointer"
                                onClick={() => searchTag(tag)}
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

export default BlogCardLarge;

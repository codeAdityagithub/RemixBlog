import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { BlogDocumentwUser } from "~/models/Schema.server";

const BlogCardLarge = ({
    _id,
    desc,
    thumbnail,
    title,
}: Pick<BlogDocumentwUser, "_id" | "desc" | "thumbnail" | "title">) => {
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
            <CardContent className="p-6 flex">
                <div className="flex-[3]">
                    <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                        {title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed line-clamp-2">
                        {desc}
                    </p>
                </div>
                <Link
                    className="flex-1 flex items-center justify-end"
                    to={`/blogs/${_id}`}
                    prefetch="intent"
                >
                    <Button>Read More</Button>
                </Link>
            </CardContent>
        </Card>
    );
};

export default BlogCardLarge;

import { Card, CardContent } from "~/components/ui/card";

type Props = {};

const BlogCardLarge = (props: Props) => {
    return (
        <Card>
            <img
                alt="Blog Post Image"
                className="w-full h-[300px] md:h-[400px] object-cover rounded-t-lg"
                height={600}
                src="/placeholder.svg"
                style={{
                    aspectRatio: "1200/600",
                    objectFit: "cover",
                }}
                width={1200}
            />
            <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                    The Future of Web Development
                </h2>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    Explore the latest trends and technologies shaping the
                    future of web development. From AI-powered tools to
                    serverless architectures, discover how the industry is
                    evolving.
                </p>
            </CardContent>
        </Card>
    );
};

export default BlogCardLarge;

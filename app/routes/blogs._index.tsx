import { json, useLoaderData } from "@remix-run/react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "~/components/ui/carousel";
import { connect } from "~/db.server";

import { TypographyH2 } from "~/components/Typography";
import cache from "~/models/modelCache.server";
import BlogCardLarge from "~/mycomponents/cards/BlogCardLarge";
import BlogCardSmall from "~/mycomponents/cards/BlogCardSmall";

export const loader = async ({}) => {
    await connect();
    const latestBlogs = cache.latestBlogs;
    const popularBlogs = cache.popularBlogs;
    const trendingBlogs = cache.trendingBlogs;
    return json(
        { latestBlogs, popularBlogs, trendingBlogs },
        { headers: { "Cache-control": "max-age=300" } }
    );
};

// function useCarouselHeight() {
//     const ref = useRef<HTMLDivElement>(null);
//     const [carouselHeight, setCarouselHeight] = useState(0);

//     useEffect(() => {
//         if (ref.current) {
//             const height = ref.current.offsetHeight;
//             setCarouselHeight(height);
//         }
//     }, []);

//     return [ref, carouselHeight] as const;
// }

const AllBlogs = () => {
    const { latestBlogs, popularBlogs, trendingBlogs } =
        useLoaderData<typeof loader>();
    return (
        <div className="container py-6 grid gap-6 grid-cols-1 lg:grid-cols-5">
            {/* Popular Topics Section */}
            <Carousel
                className="col-span-5 lg:col-span-3 space-y-2"
                opts={{ loop: true }}
            >
                <TypographyH2>
                    <span className="text-4xl font-black mr-2">|</span>Popular
                    Topics
                </TypographyH2>
                <CarouselContent>
                    {popularBlogs.map((blog) => (
                        <CarouselItem
                            className="md:basis-1/2 lg:basis-full"
                            key={blog._id.toString()}
                        >
                            <BlogCardLarge
                                _id={blog._id}
                                desc={blog.desc}
                                thumbnail={blog.thumbnail}
                                title={blog.title}
                                tags={blog.tags}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

            {/* Trending Topics Section */}
            <div className="col-span-5 lg:col-span-2 flex flex-col gap-2 lg:h-[600px] lg:pb-8">
                <TypographyH2>
                    <span className="text-4xl font-black lg:mx-2">|</span>
                    Trending Topics
                </TypographyH2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] lg:px-4 gap-4 h-full overflow-auto ver_scroll">
                    {trendingBlogs.map((blog) => (
                        <BlogCardSmall
                            // @ts-expect-error
                            _id={blog._id}
                            key={blog._id.toString()}
                            author={blog.author}
                            desc={blog.desc}
                            thumbnail={blog.thumbnail}
                            title={blog.title}
                            tags={blog.tags}
                            updatedAt={new Date(blog.updatedAt)}
                        />
                    ))}
                </div>
            </div>

            {/* Latest Blogs Section */}
            <div className="col-span-5 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <h2 className="col-span-full font-semibold text-3xl mb-2">
                    <span className="text-4xl font-black mr-2">|</span>
                    Latest Blogs
                </h2>
                {latestBlogs.map((blog) => (
                    <BlogCardSmall
                        // @ts-expect-error
                        _id={blog._id}
                        key={blog._id.toString()}
                        author={blog.author}
                        desc={blog.desc}
                        thumbnail={blog.thumbnail}
                        tags={blog.tags}
                        title={blog.title}
                        updatedAt={new Date(blog.updatedAt)}
                    />
                ))}
            </div>
        </div>
    );
};

export default AllBlogs;

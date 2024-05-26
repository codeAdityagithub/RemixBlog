import {
    Await,
    defer,
    json,
    useLoaderData,
    useNavigation,
} from "@remix-run/react";
import { connect } from "~/db.server";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "~/components/ui/carousel";

import cache from "~/models/modelCache.server";
import { Blogs } from "~/models/Schema.server";
import AllBlogsLoader from "~/mycomponents/AllBlogsLoader";
import BlogCardLarge from "~/mycomponents/cards/BlogCardLarge";
import BlogCardSmall from "~/mycomponents/cards/BlogCardSmall";
import BlogSkeletonlg from "~/mycomponents/cards/BlogSkeletonlg";
import { TypographyH2 } from "~/components/Typography";
import { useEffect, useRef, useState } from "react";

export const loader = async ({}) => {
    await connect();
    const latestBlogs = cache.latestBlogs;
    const popularBlogs = cache.popularBlogs;
    const trendingBlogs = cache.trendingBlogs;
    return json(
        { latestBlogs, popularBlogs, trendingBlogs },
        { headers: { "Cache-control": "max-age=3600" } }
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
                            _id={blog._id}
                            key={blog._id.toString()}
                            // @ts-expect-error

                            author={blog.author}
                            desc={blog.desc}
                            thumbnail={blog.thumbnail}
                            title={blog.title}
                            updatedAt={blog.updatedAt}
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
                        _id={blog._id}
                        key={blog._id.toString()}
                        // @ts-expect-error

                        author={blog.author}
                        desc={blog.desc}
                        thumbnail={blog.thumbnail}
                        title={blog.title}
                        updatedAt={blog.updatedAt}
                    />
                ))}
            </div>
        </div>
    );
};

export default AllBlogs;

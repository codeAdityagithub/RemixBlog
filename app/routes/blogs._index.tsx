import {
  Await,
  ShouldRevalidateFunction,
  json,
  useLoaderData,
} from "@remix-run/react";
import type { HeadersFunction } from "@remix-run/node"; // or cloudflare/deno
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { connect } from "~/db.server";

import { TypographyH2 } from "~/components/Typography";
import { getBlogs } from "~/models/modelCache.server";
import BlogCardLarge from "~/mycomponents/cards/BlogCardLarge";
import BlogCardSmall from "~/mycomponents/cards/BlogCardSmall";
import { defer, MetaFunction } from "@remix-run/node";
import { Suspense } from "react";
import AllBlogsLoader from "~/mycomponents/loaders/AllBlogsLoader";

export const meta: MetaFunction = () => {
  return [
    { title: "RemixBlog | Blogs" },
    {
      name: "description",
      content: "Explore the most popular, trending and latest blogs.",
    },
  ];
};

export const loader = async ({}) => {
  await connect();
  const allBlogs = getBlogs();
  return defer(
    { allBlogs },
    {
      headers: {
        "Cache-Control": "max-age=1800, stale-while-revalidate=300",
      },
    }
  );
};

export const headers: HeadersFunction = ({ loaderHeaders }) => ({
  "Cache-Control": loaderHeaders.get("Cache-Control")!,
});

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

const AllBlogs = () => {
  const { allBlogs } = useLoaderData<typeof loader>();

  return (
    <div className="container py-6 grid gap-6 grid-cols-1 lg:grid-cols-5">
      {/* Popular Topics Section */}
      <Suspense fallback={<AllBlogsLoader />}>
        <Await resolve={allBlogs}>
          {({ latestBlogs, popularBlogs, trendingBlogs }) => (
            <>
              <Carousel
                className="col-span-5 lg:col-span-3 space-y-2"
                opts={{ loop: true }}
              >
                <h2 className="col-span-full font-semibold text-3xl mb-6">
                  <span className="text-4xl font-black mr-2">|</span>
                  Popular Blogs
                </h2>
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
              <div className="col-span-5 lg:col-span-2 flex flex-col gap-2 lg:h-[600px] lg:pb-6 pt-2">
                <h2 className="col-span-full font-semibold text-3xl mb-4">
                  <span className="text-4xl font-black mr-2">|</span>
                  Trending Blogs
                </h2>
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
                      createdAt={new Date(blog.createdAt)}
                    />
                  ))}
                </div>
              </div>

              {/* Latest Blogs Section */}
              <div className="col-span-5 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 pt-2">
                <h2 className="col-span-full font-semibold text-3xl mb-6">
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
                    createdAt={new Date(blog.createdAt)}
                  />
                ))}
              </div>
            </>
          )}
        </Await>
      </Suspense>
    </div>
  );
};

export default AllBlogs;

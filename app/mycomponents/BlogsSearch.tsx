import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Link, useSearchParams } from "@remix-run/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ObjectId } from "mongoose";
import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

type Props = {};
const findBlogs = async (
    query: string,
    page: number = 1,
    signal: AbortSignal
) => {
    const res = await fetch(`/api/search?query=${query}&page=${page}`, {
        signal: signal,
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Something went wrong");
    return data.results as { _id: ObjectId; title: string }[];
};
const BlogsSearch = (props: Props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tag = searchParams.get("searchTag");
    const [query, setQuery] = useState("");
    const input = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (tag) {
            input.current?.focus();
            setQuery(tag);
        }
    }, [tag]);

    const {
        data: results,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery({
        queryKey: ["searchBlogs", query],
        initialPageParam: 1,
        queryFn: ({ pageParam, signal }) => findBlogs(query, pageParam, signal),
        enabled: query.length >= 2,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage?.length === 0 ? null : lastPageParam + 1,
        staleTime: 1000 * 60 * 2,
    });

    return (
        <div className="mx-auto relative sm:w-[300px]">
            <span className="absolute top-1/2 -translate-y-1/2 left-0 py-3 px-2">
                <FaSearch />
            </span>
            <Input
                placeholder="Search"
                className="pl-8"
                ref={input}
                value={query}
                onBlur={(e) => {
                    setSearchParams((prev) => {
                        prev.delete("searchTag");
                        return prev;
                    });
                    setQuery("");
                }}
                onChange={(e) => {
                    setQuery(e.target.value);
                }}
            />
            <div className="absolute top-full left-0 w-full max-h-96 overflow-auto bg-background rounded-md ver_scroll space-y-2 p-2 empty:p-0">
                {isError && (
                    <p className="text-center text-xl">Something went wrong!</p>
                )}
                {results &&
                    results.pages.flat().map((blog) => (
                        <div
                            className="p-2 bg-secondary text-sm flex justify-between items-center rounded-md"
                            key={blog._id.toString()}
                        >
                            {blog.title}
                            <Link
                                to={`/blogs/${blog._id}`}
                                prefetch="intent"
                                onClick={() => setQuery("")}
                            >
                                <Button variant="link">Read</Button>
                            </Link>
                        </div>
                    ))}
                {results && results.pages[0].length > 0 && (
                    <Button
                        onClick={() => fetchNextPage({ cancelRefetch: false })}
                        disabled={isFetchingNextPage || !hasNextPage}
                        className="w-full"
                        size="sm"
                        variant="ghost"
                    >
                        <ChevronDownIcon />
                    </Button>
                )}
                {results && results.pages[0].length === 0 && (
                    <p className="text-center p-1.5">No results</p>
                )}
            </div>
        </div>
    );
};
export default BlogsSearch;

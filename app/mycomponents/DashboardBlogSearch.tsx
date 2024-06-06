import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { BlogDocument } from "~/models/Schema.server";
import { getFromCache } from "~/utils/localStorageCache.client";
import DashboardBlogCard from "./DashboardBlogCard";

type Props = {};
type BlogDoc = Pick<BlogDocument, "_id" | "desc" | "title" | "updatedAt">;

const DashboardBlogSearch = (props: Props) => {
    const [query, setQuery] = useState("");
    const [blogs, setBlogs] = useState<BlogDoc[]>([]);
    const [results, setResults] = useState<BlogDoc[]>([]);
    useEffect(() => {
        function set() {
            setBlogs(getFromCache("dashboardBlogs")?.blogs ?? []);
            console.log("event fired");
        }
        set();
        window.addEventListener("localStorageChange", set);
        return () => {
            window.removeEventListener("localStorageChange", set);
        };
    }, []);
    useEffect(() => {
        if (query.trim() !== "") {
            setResults(
                blogs.filter((res) => res.title?.toLowerCase().includes(query))
            );
        } else setResults([]);
    }, [query, blogs]);
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                    <FaSearch />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90svh] flex flex-col ">
                <DialogHeader>
                    <DialogTitle>Search your blogs {blogs.length}</DialogTitle>
                </DialogHeader>
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search query..."
                    autoFocus
                />
                <div className="flex flex-col gap-2 flex-1 overflow-auto ver_scroll">
                    {query.trim() !== "" ? (
                        results.map((res) => (
                            <DashboardBlogCard
                                _id={res._id.toString()}
                                title={res.title}
                                desc={res.desc}
                                updatedAt={res.updatedAt.toString()}
                                key={`search-${res._id}`}
                            />
                        ))
                    ) : (
                        <span className="text-muted-foreground px-2">
                            Search Something
                        </span>
                    )}
                    {results.length === 0 && query.trim() !== "" ? (
                        <span className="text-muted-foreground px-2">
                            No Blogs Found 😓
                        </span>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
};
export default DashboardBlogSearch;

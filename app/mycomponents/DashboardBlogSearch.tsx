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
import DashboardBlogCard from "./cards/DashboardBlogCard";
import { BlogDoc } from "~/routes/dashboard.blogs._index";
import DashboardAllblogFilter from "./DashboardAllblogFilter";
import DashboardSearchCard from "./cards/DashboardSearchCard";

type Props = {};

const DashboardBlogSearch = (props: Props) => {
  const [query, setQuery] = useState("");
  const [blogs, setBlogs] = useState<BlogDoc[]>([]);
  const [results, setResults] = useState<BlogDoc[]>([]);
  useEffect(() => {
    function set() {
      setBlogs(getFromCache("dashboardBlogs")?.blogs ?? []);
      // console.log("event fired");
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
    <div className="md:border-l px-4 ml-1 flex h-full items-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="flex gap-2 "
          >
            <FaSearch />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90svh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Search your blogs ({blogs.length})</DialogTitle>
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
                <DashboardSearchCard
                  key={res._id}
                  {...res}
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
      <DashboardAllblogFilter />
    </div>
  );
};
export default DashboardBlogSearch;

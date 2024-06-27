import { useSearchParams } from "@remix-run/react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "~/components/ui/select";

import { BsSortAlphaDown, BsSortAlphaUp } from "react-icons/bs";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
type Props = {};
const DashboardAllblogFilter = (props: Props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    return (
        <div className="w-full px-4 flex gap-4 items-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                        by: {searchParams.get("sortBy") ?? "createdAt"}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="space-y-1">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {["createdAt", "views", "likes", "comments", "title"].map(
                        (val) => (
                            <DropdownMenuItem
                                key={val}
                                className={`${
                                    searchParams.get("sortBy") === val
                                        ? "bg-secondary"
                                        : ""
                                }`}
                                onClick={() => {
                                    setSearchParams((prev) => {
                                        prev.set("sortBy", val);
                                        return prev;
                                    });
                                }}
                            >
                                {val}
                            </DropdownMenuItem>
                        )
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                value={searchParams.get("sort") ?? "asc"}
                onClick={(e) => {
                    setSearchParams((prev) => {
                        prev.set(
                            "sort",
                            e.currentTarget.value === "asc" ? "dsc" : "asc"
                        );
                        return prev;
                    });
                }}
            >
                {searchParams.get("sort") === "dsc" ? (
                    <BsSortAlphaUp className="mr-1 text-lg" />
                ) : (
                    <BsSortAlphaDown className="mr-1 text-lg" />
                )}
            </Button>
            {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                        {searchParams.get("sort") === "dsc" ? (
                            <BsSortAlphaUp className="mr-1 text-lg" />
                        ) : (
                            <BsSortAlphaDown className="mr-1 text-lg" />
                        )}
                        {searchParams.get("sort") === "dsc" ? "Desc" : "Asc"}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="space-y-1">
                    <DropdownMenuLabel>Sorting</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className={`${
                            searchParams.get("sort") === "asc"
                                ? "bg-secondary"
                                : ""
                        }`}
                        onClick={() => {
                            setSearchParams((prev) => {
                                prev.set("sort", "asc");
                                return prev;
                            });
                        }}
                    >
                        Ascending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className={`${
                            searchParams.get("sort") === "dsc"
                                ? "bg-secondary"
                                : ""
                        }`}
                        onClick={() => {
                            setSearchParams((prev) => {
                                prev.set("sort", "dsc");
                                return prev;
                            });
                        }}
                    >
                        Descending
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu> */}
        </div>
    );
};
export default DashboardAllblogFilter;

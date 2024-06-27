import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
    FetcherWithComponents,
    Link,
    useLocation,
    useSearchParams,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";
import { getPaginationRange } from "~/utils/general";

type Props = {
    totalBlogs: number;
};
const DashboardPagination = ({ totalBlogs }: Props) => {
    const totalPages = Math.ceil(totalBlogs / 10);
    const [searchParams, setSearchParams] = useSearchParams();
    const activePage = parseInt(searchParams.get("page") ?? "1");
    const paginationRange = getPaginationRange(totalPages, activePage);
    return (
        <Pagination className="mt-1">
            <PaginationContent>
                {activePage === 1 ? null : (
                    <PaginationItem>
                        <Button
                            aria-label="Go to previous page"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                                setSearchParams((prev) => {
                                    prev.set(
                                        "page",
                                        (activePage - 1).toString()
                                    );
                                    return prev;
                                })
                            }
                            // to={`?page=${activePage - 1}`}
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                            <span className="hidden sm:block">Previous</span>
                        </Button>
                    </PaginationItem>
                )}
                <div className="flex max-w-[250px] gap-1 overflow-x-clip">
                    {paginationRange.map((i) => (
                        <PaginationItem key={`page-${i}`}>
                            <Button
                                size="icon"
                                className="h-8 w-8"
                                variant={i === activePage ? "outline" : "ghost"}
                                onClick={() =>
                                    setSearchParams((prev) => {
                                        prev.set("page", i.toString());
                                        return prev;
                                    })
                                }
                            >
                                {i}
                            </Button>
                        </PaginationItem>
                    ))}
                </div>
                {/* <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem> */}
                {activePage === totalPages ? null : (
                    <PaginationItem>
                        <Button
                            aria-label="Go to next page"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                                setSearchParams((prev) => {
                                    prev.set(
                                        "page",
                                        (activePage + 1).toString()
                                    );
                                    return prev;
                                })
                            }
                        >
                            <span className="hidden sm:block">Next</span>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
};
export default DashboardPagination;

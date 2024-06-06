import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { FetcherWithComponents, Link, useSearchParams } from "@remix-run/react";
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
    const activePage = parseInt(useSearchParams()[0].get("page") ?? "1");

    const paginationRange = getPaginationRange(totalPages, activePage);
    return (
        <Pagination className="mt-1">
            <PaginationContent>
                {activePage === 1 ? null : (
                    <PaginationItem>
                        <PaginationLink to={`?page=${activePage - 1}`}>
                            <ChevronLeftIcon />
                            <span className="hidden sm:block">Previous</span>
                        </PaginationLink>
                    </PaginationItem>
                )}
                <div className="flex max-w-[250px] gap-1 overflow-x-clip">
                    {paginationRange.map((i) => (
                        <PaginationItem key={`page-${i}`}>
                            <PaginationLink
                                to={`?page=${i}`}
                                isActive={i === activePage}
                            >
                                {i}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                </div>
                {/* <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem> */}
                {activePage === totalPages ? null : (
                    <PaginationItem>
                        <PaginationLink to={`?page=${activePage + 1}`}>
                            <ChevronRightIcon />
                            <span className="hidden sm:block">Next</span>
                        </PaginationLink>
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
};
export default DashboardPagination;

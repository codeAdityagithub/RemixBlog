import { FetcherWithComponents, useSearchParams } from "@remix-run/react";
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
        <Pagination>
            <PaginationContent>
                {activePage === 1 ? null : (
                    <PaginationItem>
                        <PaginationPrevious to={`?page=${activePage - 1}`} />
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
                        <PaginationNext to={`?page=${activePage + 1}`} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
};
export default DashboardPagination;

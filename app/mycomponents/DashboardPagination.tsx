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

type Props = {
    totalBlogs: number;
};
const DashboardPagination = ({ totalBlogs }: Props) => {
    const totalPages = Math.ceil(totalBlogs / 10);
    const activePage = parseInt(useSearchParams()[0].get("page") ?? "1");
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious to="#" />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={`page-${i}`}>
                        <PaginationLink
                            to={`?page=${i + 1}`}
                            isActive={i + 1 === activePage}
                        >
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                {/* <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem> */}
                <PaginationItem>
                    <PaginationNext to="#" />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
export default DashboardPagination;

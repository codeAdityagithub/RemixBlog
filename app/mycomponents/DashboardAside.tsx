import { CaretLeftIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

// const Links = [
//     {to:"/new", title:"Create a new Blog"}
// ]

const DashboardAside = ({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: any;
}) => {
    const handleCLick = () => setIsOpen(false);
    return (
        <aside
            className={cn(
                "w-64 sm:w-72 p-4 pt-2 h-full flex flex-col z-20 transition-transform backdrop-blur-sm border-r",
                isOpen
                    ? "absolute top-0 translate-x-0 lg:relative lg:translate-x-0"
                    : "absolute top-0 -translate-x-72 lg:relative lg:translate-x-0"
            )}
        >
            <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden self-end p-2 mb-2"
            >
                <Cross1Icon />
            </button>
            <div className="flex flex-col gap-2 items-start justify-center w-full">
                <Button className="w-full" size="icon">
                    <Link
                        to="/dashboard/new"
                        onClick={handleCLick}
                        className="w-full h-full flex items-center justify-center"
                    >
                        Create a new
                    </Link>
                </Button>
                <Button className="w-full" size="icon" variant="secondary">
                    <Link
                        to="/dashboard/blogs"
                        onClick={handleCLick}
                        className="w-full h-full flex items-center justify-center"
                    >
                        Your Blogs
                    </Link>
                </Button>
            </div>
        </aside>
    );
};

export default DashboardAside;

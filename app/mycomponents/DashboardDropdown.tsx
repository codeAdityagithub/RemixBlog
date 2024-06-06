import { NavLink, useLocation } from "@remix-run/react";
import { FaSearch } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";
import DashboardBlogSearch from "./DashboardBlogSearch";

type Props = {};

const DashboardDropdown = (props: Props) => {
    const isDashboard = useLocation().pathname.endsWith("/blogs");
    // console.log(isDashboard);
    return (
        <>
            <div className="hidden sm:flex flex-row gap-2 items-end justify-center sm:justify-start h-10 px-2 sm:px-6 border-b w-full">
                <Button
                    size="sm"
                    asChild
                    variant="ghost"
                    className="hover:bg-secondary/60"
                >
                    <NavLink to="/dashboard" end className="tablink">
                        Dashboard
                    </NavLink>
                </Button>
                <Button
                    size="sm"
                    asChild
                    variant="ghost"
                    className="hover:bg-secondary/60"
                >
                    <NavLink to="/dashboard/new" className="tablink">
                        New Blog
                    </NavLink>
                </Button>
                <Button
                    size="sm"
                    asChild
                    variant="ghost"
                    className="hover:bg-secondary/60"
                >
                    <NavLink to="/dashboard/blogs" className="tablink">
                        Your Blogs
                    </NavLink>
                </Button>
                {isDashboard ? <DashboardBlogSearch /> : null}
            </div>
            <div className="sm:hidden flex flex-row items-center justify-end gap-4 px-4 sm:px-8 h-10 border-b">
                {isDashboard ? <DashboardBlogSearch /> : null}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                            <BsThreeDots />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Button
                                size="sm"
                                asChild
                                variant="ghost"
                                className="hover:bg-secondary/60"
                            >
                                <NavLink
                                    to="/dashboard"
                                    end
                                    className="tablink"
                                >
                                    Dashboard
                                </NavLink>
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Button
                                size="sm"
                                asChild
                                variant="ghost"
                                className="hover:bg-secondary/60"
                            >
                                <NavLink
                                    to="/dashboard/new"
                                    className="tablink"
                                >
                                    New Blog
                                </NavLink>
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Button
                                size="sm"
                                asChild
                                variant="ghost"
                                className="hover:bg-secondary/60"
                            >
                                <NavLink
                                    to="/dashboard/blogs"
                                    className="tablink"
                                >
                                    Your Blogs
                                </NavLink>
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
};

export default DashboardDropdown;

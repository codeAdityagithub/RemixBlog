import { NavLink } from "@remix-run/react";
import { Button } from "~/components/ui/button";

type Props = {};

const DashboardDropdown = (props: Props) => {
    return (
        // <div>
        <div className="flex flex-row gap-2 items-end justify-start h-10 px-6 border-b w-full">
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
                <NavLink to="/dashboard/blogs" className="tablink">
                    Your Blogs
                </NavLink>
            </Button>
            <Button
                size="sm"
                asChild
                variant="ghost"
                className="hover:bg-secondary/60"
            >
                <NavLink to="/dashboard/new" className="tablink">
                    Create a new
                </NavLink>
            </Button>
        </div>
        // </div>
    );
};

export default DashboardDropdown;

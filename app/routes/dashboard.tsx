import { HamburgerMenuIcon, SlashIcon } from "@radix-ui/react-icons";
import { Link, Outlet, useLocation } from "@remix-run/react";
import { useState } from "react";
import DashboardAside from "~/mycomponents/DashboardAside";
import DashboardDropdown from "~/mycomponents/DashboardDropdown";

type Props = {};

const Dashboard = (props: Props) => {
    // const [isOpen, setIsOpen] = useState(false);
    // const breadcrumbs = useLocation()
    //     .pathname.split("/")
    //     .splice(1)
    //     .map((str) =>
    //         str !== "" ? str[0]?.toUpperCase() + str?.slice(1) : ""
    //     );
    // console.log(breadcrumbs);

    return (
        <div className="w-full h-full flex flex-col relative bg-background text-foreground">
            <DashboardDropdown />

            <div className="p-4 pb-2 flex flex-col flex-1 items-center justify-start h-[calc(100vh-100px)] max-h-[calc(100vh-100px)] overflow-auto ver_scroll">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;

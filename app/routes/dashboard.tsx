import { HamburgerMenuIcon, SlashIcon } from "@radix-ui/react-icons";
import { Link, Outlet, useLocation } from "@remix-run/react";
import { useState } from "react";
import DashboardAside from "~/mycomponents/DashboardAside";
import DashboardDropdown from "~/mycomponents/DashboardDropdown";

type Props = {};

const Dashboard = (props: Props) => {
    // const [isOpen, setIsOpen] = useState(false);
    const breadcrumbs = useLocation()
        .pathname.split("/")
        .splice(1)
        .map((str) =>
            str !== "" ? str[0]?.toUpperCase() + str?.slice(1) : ""
        );
    // console.log(breadcrumbs);

    return (
        <div className="w-full h-full flex relative bg-background text-foreground">
            {/* <DashboardAside isOpen={isOpen} setIsOpen={setIsOpen} /> */}
            <section className="flex-1 flex flex-col">
                <DashboardDropdown />
                {/* <div className="flex items-center justify-start bg-background/60 px-6 py-2"> */}
                {/* <button
                        onClick={() => setIsOpen(true)}
                        className="lg:hidden pr-2 py-1"
                    >
                        <HamburgerMenuIcon />
                    </button>
                    {breadcrumbs.map((crumb, ind, arr) => {
                        const link = arr
                            .slice(0, ind + 1)
                            .reduce(
                                (prev, cur) =>
                                    prev.toLowerCase() +
                                    "/" +
                                    cur.toLowerCase(),
                                ""
                            );
                        // console.log(arr.length);
                        return (
                            <span key={crumb} className="flex items-center">
                                <Link to={link}>{crumb}</Link>
                                {ind !== arr.length - 1 ? (
                                    <SlashIcon className="translate-y-[1px]" />
                                ) : null}
                            </span>
                        );
                    })} */}
                {/* </div> */}
                <div className="p-4 flex flex-1 items-start justify-center h-[calc(100vh-100px)] max-h-[calc(100vh-100px)] overflow-auto ver_scroll">
                    <Outlet />
                </div>
            </section>
        </div>
    );
};

export default Dashboard;

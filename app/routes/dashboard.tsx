import { HamburgerMenuIcon, SlashIcon } from "@radix-ui/react-icons";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { authenticator } from "~/auth.server";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import DashboardAside from "~/mycomponents/DashboardAside";

type Props = {};

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    return { user };
}

const Dashboard = (props: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const breadcrumbs = useLocation()
        .pathname.split("/")
        .splice(1)
        .map((str) => str[0].toUpperCase() + str.slice(1));
    // console.log(breadcrumbs);

    return (
        <div className="w-full h-full flex relative">
            <DashboardAside isOpen={isOpen} setIsOpen={setIsOpen} />
            <section className="flex-1 flex flex-col">
                <div className="flex items-center justify-start bg-background/60 p-2">
                    <button
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
                    })}
                </div>
                <div className="p-4 flex flex-1 items-center justify-center">
                    <Outlet />
                </div>
            </section>
        </div>
    );
};

export default Dashboard;

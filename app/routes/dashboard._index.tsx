import { HeartFilledIcon } from "@radix-ui/react-icons";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useQuery } from "@tanstack/react-query";
import { FaComments } from "react-icons/fa";
import { FaUsersViewfinder } from "react-icons/fa6";
import { authenticator } from "~/auth.server";
import { Skeleton } from "~/components/ui/skeleton";
import BlogViewsChart from "~/mycomponents/BlogViewsChart";
import DashboardComments from "~/mycomponents/DashboardComments";
import TopPerformingBlogs from "~/mycomponents/TopPerformingBlogs";
import DashboardAnalyticCard from "~/mycomponents/cards/DashboardAnalyticCard";
import Dashboarduser from "~/mycomponents/cards/Dashboarduser";
import { getGreeting, useUser } from "~/utils/general";

export const meta: MetaFunction = () => {
    return [
        { title: "RemixBlog | Dashboard" },
        {
            name: "description",
            content:
                "Manage all your blogs and personal information on remix blog dashboard",
        },
    ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticator.isAuthenticated(request, {
        failureRedirect: "/login?redirectTo=/dashboard/blogs",
    });
    return {};
};

const Dashboard = () => {
    const user = useUser();
    const { data, isLoading } = useQuery({
        // initialData: initial,
        queryKey: ["analytics", user?._id],
        queryFn: async () => {
            const data = await fetch("/dashboard/analytics", {
                credentials: "same-origin",
            }).then((res) => res.json());
            return data;
        },
        refetchInterval: 1000 * 60,
        staleTime: 1000 * 60,
    });

    return (
        <div className="w-full grid grid-cols-6 place-content-start gap-8 p-2">
            <header className="col-span-6">
                <h2 className="text-2xl font-bold text-muted-foreground">
                    Welcome Back! 👋
                </h2>
                <p className="text-muted-foreground">{getGreeting()}</p>
            </header>
            <h2 className="col-span-6 text-2xl font-bold">Overview</h2>
            <div className="col-span-6 md:col-span-2">
                {isLoading || !data ? (
                    <Skeleton className="h-[280px] sm:h-[400px]" />
                ) : (
                    <Dashboarduser
                        totalBlogs={data.analytics.totalBlogs}
                        followers={data.followers}
                        following={data.following}
                    />
                )}
            </div>
            <div className="col-span-6 md:col-span-4 grid place-content-start grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                {isLoading || !data ? (
                    <>
                        <Skeleton className="h-[120px]" />
                        <Skeleton className="h-[120px]" />
                        <Skeleton className="h-[120px]" />
                    </>
                ) : (
                    <>
                        <DashboardAnalyticCard
                            cardValue={data.analytics.totalViews}
                            cardTitle="Views"
                            cardIcon={<FaUsersViewfinder className="w-8 h-8" />}
                        />
                        <DashboardAnalyticCard
                            cardValue={data.analytics.totalLikes}
                            cardTitle="Likes"
                            cardIcon={<HeartFilledIcon className="w-8 h-8" />}
                        />
                        <DashboardAnalyticCard
                            cardValue={data.analytics.totalComments}
                            cardTitle="Comments"
                            cardIcon={<FaComments className="w-8 h-8" />}
                        />
                    </>
                )}
            </div>
            <DashboardComments />
            <BlogViewsChart />
            <TopPerformingBlogs />
        </div>
    );
};

export default Dashboard;

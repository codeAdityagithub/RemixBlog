import { EyeOpenIcon, HeartFilledIcon } from "@radix-ui/react-icons";
import {
    LoaderFunction,
    LoaderFunctionArgs,
    MetaFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { FaComments } from "react-icons/fa";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { getAnalytics } from "~/models/dashboard.server";
import DashboardAnalyticCard from "~/mycomponents/cards/DashboardAnalyticCard";
import Dashboarduser from "~/mycomponents/cards/Dashboarduser";
import { getGreeting, useUser } from "~/utils/general";
import { FaUsersViewfinder } from "react-icons/fa6";
import DashboardComments from "~/mycomponents/DashboardComments";
import BlogViewsChart from "~/mycomponents/BlogViewsChart";
import { getFollowStats } from "~/models/follow.server";
import { Types } from "mongoose";

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
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login?redirectTo=/dashboard",
    });
    await connect();
    const analytics = await getAnalytics(user._id);
    const { followersCount, followingCount } = await getFollowStats(
        new Types.ObjectId(user._id)
    );
    return { analytics, followers: followersCount, following: followingCount };
};

const Dashboard = () => {
    const {
        analytics: initial,
        followers,
        following,
    } = useLoaderData<typeof loader>();
    // const fetcher = useFetcher<any>();
    const user = useUser();
    const { data: analytics, isLoading } = useQuery({
        initialData: initial,
        queryKey: ["analytics", user?._id],
        queryFn: async () => {
            const data = await fetch("/dashboard/analytics", {
                credentials: "same-origin",
            }).then((res) => res.json());
            return data?.analytics;
        },
        refetchInterval: 1000 * 60,
        enabled: initial.totalBlogs > 0,
    });

    // const analytics = fetcher.data?.analytics;
    // useEffect(() => {
    //     fetcher.load("analytics");
    //     setInterval(() => {
    //         if (fetcher.state == "idle") fetcher.load("");
    //     }, 1000 * 60);
    // }, []);
    // console.log(comments);
    if (isLoading || !analytics) return <div>Loading...</div>;
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
                <Dashboarduser
                    totalBlogs={analytics.totalBlogs}
                    followers={followers}
                    following={following}
                />
            </div>
            <div className="col-span-6 md:col-span-4 grid place-content-start grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <DashboardAnalyticCard
                    cardValue={analytics.totalViews}
                    cardTitle="Views"
                    cardIcon={<FaUsersViewfinder className="w-8 h-8" />}
                />
                <DashboardAnalyticCard
                    cardValue={analytics.totalLikes}
                    cardTitle="Likes"
                    cardIcon={<HeartFilledIcon className="w-8 h-8" />}
                />
                <DashboardAnalyticCard
                    cardValue={analytics.totalComments}
                    cardTitle="Comments"
                    cardIcon={<FaComments className="w-8 h-8" />}
                />
            </div>
            <DashboardComments />
            <BlogViewsChart />
        </div>
    );
};

export default Dashboard;

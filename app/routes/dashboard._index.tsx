import { EyeOpenIcon, HeartFilledIcon } from "@radix-ui/react-icons";
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { FaComments } from "react-icons/fa";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { getAnalytics } from "~/models/dashboard.server";
import DashboardAnalyticCard from "~/mycomponents/cards/DashboardAnalyticCard";
import Dashboarduser from "~/mycomponents/cards/Dashboarduser";
import { getGreeting } from "~/utils/general";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login?redirectTo=/dasbhoard",
    });
    await connect();
    const analytics = await getAnalytics(user._id);
    return { analytics };
};

const Dashboard = () => {
    const analytics = useLoaderData<typeof loader>().analytics;

    return (
        <div className="w-full grid grid-cols-6 place-content-start gap-4">
            <header className="col-span-6">
                <h2 className="text-2xl font-bold text-muted-foreground">
                    Welcome Back! 👋
                </h2>
                <p className="text-muted-foreground">{getGreeting()}</p>
            </header>
            <h2 className="col-span-6 text-2xl font-bold">Overview</h2>
            <div className="col-span-6  md:col-span-2">
                <Dashboarduser totalBlogs={analytics.totalBlogs} />
            </div>
            {/* <div className="col-span-6 grid grid-cols-6 gap-4 md:grid-rows-2"> */}
            <div className="col-span-6  md:col-span-4 grid place-content-start grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <DashboardAnalyticCard
                    cardValue={analytics.totalViews}
                    cardTitle="Views"
                    cardIcon={<EyeOpenIcon />}
                />
                <DashboardAnalyticCard
                    cardValue={analytics.totalLikes}
                    cardTitle="Likes"
                    cardIcon={<HeartFilledIcon />}
                />
                <DashboardAnalyticCard
                    cardValue={analytics.totalComments}
                    cardTitle="Comments"
                    cardIcon={<FaComments />}
                />
            </div>
            {/* </div> */}
        </div>
    );
};

export default Dashboard;

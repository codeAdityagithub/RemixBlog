import { Link, useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { loader } from "~/routes/api.viewchart";
import { formatTime } from "~/utils/general";

type Props = {};
const BlogViewsChart = (props: Props) => {
    const fetcher = useFetcher<typeof loader>();
    const [ref, isInView] = useInView();
    useEffect(() => {
        if (isInView && fetcher.state === "idle" && !fetcher.data)
            fetcher.load("/api/viewchart");
    }, [isInView]);

    return (
        <div
            ref={ref}
            className="col-span-6 md:col-span-3 space-y-2"
            id="dashboardChart"
        >
            {/* <Link to="/api/viewchart" prefetch="viewport" className=""></Link> */}
            <h2 className="text-2xl font-bold">Views</h2>
            {!fetcher.data?.views ? (
                <p>Something went wrong! Try again</p>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={fetcher.data.views.map((data) => ({
                            name: formatTime(data.date),
                            views: data.views,
                        }))}
                    >
                        <Line
                            type="monotone"
                            dataKey="views"
                            stroke="hsl(var(--primary))"
                        />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                            contentStyle={{
                                background: "hsl(var(--secondary))",
                                borderRadius: "var(--radius)",
                                color: "hsl(var(--secondary-foreground))",
                            }}
                        />
                        <Legend verticalAlign="top" />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};
export default BlogViewsChart;

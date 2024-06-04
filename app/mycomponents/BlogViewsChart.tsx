import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "~/components/ui/select";
import { Link, useFetcher, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
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
import { Skeleton } from "~/components/ui/skeleton";
import { loader } from "~/routes/api.viewchart";
import { formatTime } from "~/utils/general";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

type Props = {};
const BlogViewsChart = (props: Props) => {
    const [graphState, setGraphState] = useState({
        filter: "0",
        duration: "1",
    });
    const [ref, isInView] = useInView();
    const { data, isLoading, isError } = useQuery({
        queryKey: ["chart", graphState],
        queryFn: async () => {
            const res = await fetch(
                `/api/viewchart?filter=${graphState.filter}&duration=${graphState.duration}`
            );
            const data = await res.json();
            console.log(data);
            return data.views as { key: string; views: number }[];
        },
        staleTime: 1000 * 60 * 5,
        enabled: isInView,
    });

    const handleChange = (name: string, value: String) => {
        // console.log(value);
        if (
            (name === "filter" && graphState.duration <= value) ||
            (name === "duration" && graphState.filter >= value)
        ) {
            toast.error("Invalid Selection");
            return;
        }
        setGraphState((prev) => ({ ...prev, [name]: value }));
    };
    return (
        <div
            ref={ref}
            className="col-span-6 md:col-span-3 space-y-2"
            id="dashboardChart"
        >
            {/* <Link to="/api/viewchart" prefetch="viewport" className=""></Link> */}
            <div className="flex flex-col sm:flex-row gap-3">
                <h2 className="text-2xl font-bold">Views</h2>
                <Select
                    value={graphState.filter}
                    onValueChange={(val) => handleChange("filter", val)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Daily</SelectItem>
                        <SelectItem value="2">Monthly</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={graphState.duration}
                    onValueChange={(val) => handleChange("duration", val)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">Last Week</SelectItem>
                        <SelectItem value="2">Last Month</SelectItem>
                        <SelectItem value="3">Last Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {isLoading ? (
                <Skeleton className="w-full h-[400px]" />
            ) : isError ? (
                <p>Something went wrong! Try again</p>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <Line
                            type="monotone"
                            dataKey="views"
                            stroke="hsl(var(--primary))"
                        />
                        <XAxis dataKey="key" />
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

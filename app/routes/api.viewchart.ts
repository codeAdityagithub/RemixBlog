import { LoaderFunctionArgs, json } from "@remix-run/node";
import { ClientLoaderFunctionArgs } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { Blogs, Engagements } from "~/models/Schema.server";
import z from "zod";
import { headers } from "./blogs.$blogId";
import { connect } from "~/db.server";

const Schema = z
    .object({
        filter: z.enum(["0", "2"]),
        duration: z.enum(["1", "2", "3"]),
    })
    .refine(({ filter, duration }) => filter < duration, "Invalid Selection")
    .transform(({ filter, duration }) => {
        const nf = filter === "0" ? "d" : "m";
        const nd = duration === "1" ? "w" : duration === "2" ? "m" : "y";
        return { filter: nf, duration: nd } as {
            filter: "d" | "m";
            duration: "w" | "m" | "y";
        };
    });
const timeUnits = {
    w: 7 * 24 * 60 * 60000,
    m: 30 * 24 * 60 * 60000,
    y: 365 * 24 * 60 * 60000,
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login?redirectTo=/dashboard",
    });
    const f = new URL(request.url).searchParams.get("filter");
    const d = new URL(request.url).searchParams.get("duration");
    const { error, data } = Schema.safeParse({ filter: f, duration: d });
    if (error)
        return json({ error: "Invalid Selection", views: [] }, { status: 400 });
    const { filter, duration } = data;
    await connect();
    const blogIds = await Blogs.find({ author: user._id }, { _id: 1 }).lean();
    const blogIdArray = blogIds.map((blog) => blog._id);

    const durationThreshold = new Date();
    durationThreshold.setDate(
        durationThreshold.getDate() -
            Math.floor(timeUnits[duration] / (24 * 60 * 60 * 1000))
    );
    durationThreshold.setHours(0, 0, 0, 0);
    // durationThreshold.setDate(durationThreshold.getDate() - );
    try {
        let views: { key: string; views: number }[] = [];
        if (filter === "d") {
            views = await Engagements.aggregate([
                {
                    $match: {
                        blogId: { $in: blogIdArray },
                        createdAt: { $gte: durationThreshold },
                    },
                },

                {
                    $group: {
                        _id: {
                            $dateToString: {
                                date: "$createdAt",
                                format: "%Y-%m-%d",
                            },
                        },
                        views: { $sum: "$views" },
                    },
                },
                { $project: { _id: 0, key: "$_id", views: 1 } },
                { $sort: { key: 1 } },
            ]);
        } else if (filter === "m") {
            views = await Engagements.aggregate([
                {
                    $match: {
                        blogId: { $in: blogIdArray },
                        createdAt: { $gte: durationThreshold },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                date: "$createdAt",
                                format: "%Y-%m",
                            },
                        },
                        views: { $sum: "$views" },
                    },
                },
                { $project: { _id: 0, key: "$_id", views: 1 } },
                { $sort: { key: 1 } },
            ]);
        }
        // console.log(views);
        return json(
            { views, error: null },
            { headers: { "Cache-Control": "private, max-age=300" } }
        );
    } catch (error: any) {
        console.log(error?.message);
        return json(
            { error: "Something went wrong!", views: [] },
            { status: 500 }
        );
    }
    // console.log(views);
};

// export const clientLoader = ({
//     serverLoader,
//     request,
// }: ClientLoaderFunctionArgs) => {};

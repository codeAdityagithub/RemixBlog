import { LoaderFunctionArgs } from "@remix-run/node";
import { connect } from "~/db.server";
import { Blogs } from "~/models/Schema.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const search = new URL(request.url).search;
    // if (serverCache.has(search)) {
    //     return { results: serverCache.get(search) };
    // }

    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("query") ?? "";
    const regex = new RegExp(query, "i");
    const page = parseInt(searchParams.get("page") ?? "1");
    const skip = (page - 1) * 10;
    await connect();

    const results = await Blogs.find(
        {
            $or: [
                { title: { $regex: regex } },
                {
                    tags: {
                        $elemMatch: {
                            $regex: new RegExp(query, "i"),
                        },
                    },
                },
            ],
        },
        { _id: 1, title: 1 },
        { skip, limit: 10, lean: true }
    );
    // if (results.length === 10) serverCache.set(search, results);
    return { results };
};

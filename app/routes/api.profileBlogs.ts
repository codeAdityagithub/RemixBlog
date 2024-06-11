import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { connect } from "~/db.server";
import { Blogs } from "~/models/Schema.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const body = await request.json();
    const userId = body.userId;
    const page = parseInt(body.page ?? "1");
    const skip = (page - 1) * 10;
    invariant(userId);
    await connect();
    // console.log(page, skip, userId);
    const blogs = await Blogs.find(
        {
            author: userId,
        },
        { title: 1, desc: 1, likes: 1, comments: 1, createdAt: 1, thumbnail: 1 }
    )
        .skip(skip)
        .limit(10)
        .lean();
    return { blogs };
};

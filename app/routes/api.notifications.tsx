import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { FollowDoc, Follows } from "~/models/Schema.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    const blogNotifs = (await Follows.find(
        { notification: { $ne: "" }, follower: user._id },
        { notification: 1, updatedAt: 1, read: 1, link: 1 }
    ).lean()) as (Pick<
        FollowDoc,
        "notification" | "read" | "updatedAt" | "link"
    > & { _id: string })[];
    // console.log(blogNotifs);
    return { notifications: blogNotifs };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    const notificationId = (await request.formData()).get("notificationId");
    invariant(notificationId, "Notificationid is required");
    try {
        await connect();
        await Follows.updateOne(
            { _id: notificationId },
            { $set: { read: true } }
        );
        return { ok: true };
    } catch (error) {
        console.log(error);
        return json({ ok: false }, { status: 500 });
    }
};

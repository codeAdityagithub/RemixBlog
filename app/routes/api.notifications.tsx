import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import {
  FollowDoc,
  Follows,
  NotificationDoc,
  Notifications,
} from "~/models/Schema.server";

export type BlogNotif = Pick<
  FollowDoc,
  "notification" | "read" | "createdAt" | "link"
> & { _id: string };
export type OtherNotif = Pick<
  NotificationDoc,
  "createdAt" | "count" | "link" | "read" | "type"
> & { _id: string };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  await connect();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const blogNotifs = await Follows.find(
    {
      notification: { $ne: "" },
      follower: user._id,
      updatedAt: { $gt: weekAgo },
    },
    { notification: 1, updatedAt: 1, read: 1, link: 1 }
  ).lean();
  const otherNotifs = (await Notifications.find(
    { targetUser: user._id },
    { targetUser: 0, updatedAt: 0, readAt: 0 }
  ).lean()) as OtherNotif[];
  return {
    blogNotifs: blogNotifs.map(({ updatedAt, ...notif }) => ({
      ...notif,
      createdAt: updatedAt,
    })) as unknown as BlogNotif[],
    otherNotifs,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const form = await request.formData();
  const notificationId = form.get("notificationId");
  const type = form.get("type");
  invariant(notificationId, "Notificationid is required");
  try {
    await connect();
    if (type === "blogNotif") {
      await Follows.updateOne(
        { _id: notificationId },
        { $set: { read: true } }
      );
    } else if (type === "otherNotif") {
      await Notifications.updateOne(
        { _id: notificationId },
        { $set: { readAt: new Date(), read: true } }
      );
    }
    return { ok: true };
  } catch (error) {
    console.log(error);
    return json({ ok: false }, { status: 500 });
  }
};

import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { themeCookie } from "~/utils/themeCookie.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  return redirect(searchParams.get("redirect") ?? "/", {
    headers: {
      "Set-Cookie": await themeCookie.serialize(searchParams.get("theme")),
    },
  });
};

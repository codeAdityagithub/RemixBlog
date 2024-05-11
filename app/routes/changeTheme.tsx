import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { themeCookie } from "~/utils/themeCookie.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { searchParams } = new URL(request.url);
    return redirect(searchParams.get("redirect") ?? "/", {
        headers: {
            "Set-Cookie": await themeCookie.serialize(
                searchParams.get("theme")
            ),
        },
    });
};

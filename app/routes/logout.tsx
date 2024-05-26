import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const redirectTo = new URL(request.url).searchParams.get("redirectTo");
    return await authenticator.logout(request, {
        redirectTo: redirectTo ?? "/",
    });
};

export const loader = async () => redirect("/");

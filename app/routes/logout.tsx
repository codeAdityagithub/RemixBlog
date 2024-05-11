import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export const action = async ({ request }: ActionFunctionArgs) =>
    await authenticator.logout(request, { redirectTo: "/" });

export const loader = async () => redirect("/");

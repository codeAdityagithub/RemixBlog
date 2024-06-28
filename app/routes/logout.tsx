import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { ClientActionFunctionArgs } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { queryClient } from "~/root";

export const action = async ({ request }: ActionFunctionArgs) => {
    const redirectTo = new URL(request.url).searchParams.get("redirectTo");
    return await authenticator.logout(request, {
        redirectTo: redirectTo ?? "/",
    });
};

export const clientAction = async ({
    request,
    serverAction,
}: ClientActionFunctionArgs) => {
    if ("caches" in window) {
        caches.keys().then(function (names) {
            for (let name of names) caches.delete(name);
        });
    }

    // Clear local storage and session storage
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    return await serverAction();
};

export const loader = async () => redirect("/");

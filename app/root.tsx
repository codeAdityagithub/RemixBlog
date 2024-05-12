import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useRouteError,
} from "@remix-run/react";

import styles from "./tailwind.css?url";
import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import Navbar from "./mycomponents/Navbar";
import { Themes, themeCookie } from "./utils/themeCookie.server";
import { Toaster } from "./components/ui/sonner";
import RootError from "./mycomponents/RootError";
import { authenticator } from "./auth.server";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export async function loader({ request }: LoaderFunctionArgs) {
    const theme: Themes = await themeCookie.parse(
        request.headers.get("Cookie")
    );
    const user = await authenticator.isAuthenticated(request);
    if (!theme) {
        return json(
            { theme: "dark", user: user },
            {
                headers: {
                    "Set-Cookie": await themeCookie.serialize("dark"),
                },
            }
        );
    }
    return { theme, user };
}

export function ErrorBoundary() {
    const error = useRouteError();
    return (
        <html className="dark">
            <head>
                <title>Oh no!</title>
                <Meta />
                <Links />
            </head>
            <body>
                <RootError error={error} />
                <Scripts />
            </body>
        </html>
    );
}
export default function App() {
    const { theme } = useLoaderData<typeof loader>();
    return (
        <html lang="en" className={theme}>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <div className="w-full h-screen flex flex-col">
                    <Navbar />
                    <main className="h-full flex-1 grid place-items-center">
                        <Outlet />
                    </main>
                </div>
                <Toaster expand />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

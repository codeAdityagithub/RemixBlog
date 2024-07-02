import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    ShouldRevalidateFunction,
    useLoaderData,
    useRouteError,
} from "@remix-run/react";

import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authenticator } from "./auth.server";
import { Toaster } from "./components/ui/toaster";
import Navbar from "./mycomponents/Navbar";
import RootError from "./mycomponents/RootError";
import styles from "./tailwind.css?url";
// import { queryClient } from "./utils/queryClient.client";
import { Themes, themeCookie } from "./utils/themeCookie.server";
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

export const shouldRevalidate: ShouldRevalidateFunction = ({
    defaultShouldRevalidate,
    formAction,
    currentUrl,
    nextUrl,
}) => {
    // console.log(formAction);
    if (
        formAction?.startsWith("/logout") ||
        formAction?.startsWith("/api/profile") ||
        formAction?.startsWith("/login") ||
        formAction?.startsWith("/register") ||
        formAction?.startsWith("/verify")
    )
        return defaultShouldRevalidate;
    if (currentUrl.pathname === nextUrl.pathname) return false;
    return defaultShouldRevalidate;
};

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
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
    },
});
export default function App() {
    const { theme } = useLoaderData<typeof loader>();
    // console.log(queryClient);
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
                <QueryClientProvider client={queryClient}>
                    <div className="w-full h-[100svh] flex flex-col">
                        <Toaster />
                        <Navbar />
                        <main className="h-full flex-1 grid place-items-center bg-secondary text-secondary-foreground">
                            <Outlet />
                        </main>
                    </div>
                </QueryClientProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

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
import { commitSession, getSession } from "./session.server";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export async function loader({ request }: LoaderFunctionArgs) {
  const theme = await themeCookie.parse(request.headers.get("Cookie"));
  const user = await authenticator.isAuthenticated(request);
  const session = await getSession(request.headers.get("cookie"));
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
  return json(
    { theme, user },
    { headers: { "Set-Cookie": await commitSession(session) } }
  );
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  defaultShouldRevalidate,
  formAction,
  currentUrl,
  nextUrl,
}) => {
  if (
    formAction?.startsWith("/logout") ||
    formAction?.startsWith("/api/profile") ||
    formAction?.startsWith("/login") ||
    formAction?.startsWith("/register") ||
    formAction?.startsWith("/verify") ||
    formAction?.startsWith("/changeTheme")
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
    <html
      lang="en"
      className={theme}
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body className="overflow-hidden">
        <QueryClientProvider client={queryClient}>
          <div className="w-full h-[100svh] flex flex-col">
            <Toaster />
            <Navbar />
            <main
              id="mainPage"
              className="h-full flex-1 grid place-items-center bg-white/5 text-secondary-foreground"
            >
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

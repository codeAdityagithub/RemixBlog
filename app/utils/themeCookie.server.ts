import { createCookie } from "@remix-run/node";

export type Themes = "light" | "dark";

export const themeCookie = createCookie("theme", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
});

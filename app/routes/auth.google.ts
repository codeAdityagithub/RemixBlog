// app/routes/auth/google.tsx
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export let loader = () => redirect("/login");

export let action = ({ request }: ActionFunctionArgs) => {
    return authenticator.authenticate("google", request);
};

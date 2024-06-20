// app/routes/auth/google/callback.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export let loader = ({ request }: LoaderFunctionArgs) => {
    return authenticator.authenticate("google", request, {
        successRedirect: "/",
        failureRedirect: "/login",
    });
};

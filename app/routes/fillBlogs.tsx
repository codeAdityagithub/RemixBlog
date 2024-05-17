import { LoaderFunctionArgs, redirect } from "@remix-run/node";
// import { authenticator } from "~/auth.server";
// import { fillBlogs } from "~/models/functions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    // const user = await authenticator.isAuthenticated(request, {
    //     failureRedirect: "/login",
    // });
    // await fillBlogs(user._id);
    return redirect("/dashboard/blogs");
};

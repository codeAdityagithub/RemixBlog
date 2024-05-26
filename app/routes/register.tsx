import { Form, useActionData } from "@remix-run/react";
import React, { useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction,
    json,
    redirect,
} from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { register } from "~/models/functions.server";
import { RegisterFormSchema } from "~/lib/zod";
import { ZodError } from "zod";

export const meta: MetaFunction = () => {
    return [
        { title: "RemixBlog | Register" },
        { name: "description", content: "Register to RemixBlog" },
    ];
};
export async function loader({ request }: LoaderFunctionArgs) {
    await authenticator.isAuthenticated(request, {
        successRedirect: "/dashboard",
    });
    return {};
}

export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const redirectTo = new URL(request.url).searchParams.get("redirectTo");

    try {
        const { username, email, password } = RegisterFormSchema.parse({
            username: form.get("username"),
            email: form.get("email"),
            password: form.get("password"),
        });
        const user = await register(username, email, password);
        // console.log(user);
        if (!user)
            return json({ error: "User already exists" }, { status: 406 });
        // if (user) return redirect("/login");
        const res = await authenticator.authenticate("user-pass", request, {
            // failureRedirect: "/login",
            successRedirect: redirectTo ?? "/blogs",
            context: { formData: form },
        });
        return res;
    } catch (error: any) {
        if (error instanceof ZodError) {
            return json(
                { error: error.flatten().fieldErrors },
                { status: 400 }
            );
        }
        if (error instanceof Response) return error;
        return json({ error: "Something went wrong" }, { status: 500 });
    }
}

const Register = () => {
    const data = useActionData<typeof action>();
    const error = data?.error;
    const { emailError, passwordError, usernameError } =
        error && typeof error !== "string"
            ? {
                  emailError: error.email,
                  passwordError: error.password,
                  usernameError: error.username,
              }
            : { emailError: "", passwordError: "", usernameError: "" };
    // useEffect(() => {
    //     if (error && error.error) {
    //         if (typeof error.error === "string") toast.error(error.error);
    //         else if (error.error.fieldErrors) {
    //             const { email, password } = error.error.fieldErrors;
    //             if (email || password)
    //                 toast.error(
    //                     `${email ? email[0] + "<br>" : ""}${
    //                         password && password[0]
    //                     }`
    //                 );
    //         }
    //     }
    // }, [error]);
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Welcome Back!</CardTitle>
                <CardDescription>Login to see your account</CardDescription>
            </CardHeader>
            <CardContent>
                <Form method="post">
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="username">
                                Username
                                <div className="text-red-600 py-1">
                                    {usernameError}
                                </div>
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                required
                                type="text"
                                placeholder="Your username"
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">
                                Email{" "}
                                <div className="text-red-600 py-1">
                                    {emailError}
                                </div>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                required
                                type="email"
                                placeholder="someone@example.com"
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">
                                Password{" "}
                                <div className="text-red-600 py-1">
                                    {passwordError}
                                </div>
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                required
                                type="password"
                                placeholder="Your password"
                            />
                        </div>
                    </div>
                    <Button type="submit" className="mt-4">
                        Login
                    </Button>
                </Form>
            </CardContent>
            <CardFooter className="text-red-600">
                {error && typeof error === "string" ? error : null}
            </CardFooter>
        </Card>
    );
};

export default Register;

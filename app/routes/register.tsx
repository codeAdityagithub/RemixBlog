import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
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
import { useToast } from "~/components/ui/use-toast";
import { FcGoogle } from "react-icons/fc";
import { Separator } from "~/components/ui/separator";

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
            return json({ error: error.flatten() }, { status: 400 });
        }
        if (error instanceof Response) return error;
        console.log(error);
        return json({ error: "Something went wrong" }, { status: 500 });
    }
}

const Register = () => {
    const data = useActionData<typeof action>();
    const navigation = useNavigation();
    const { toast } = useToast();
    const error = data?.error;

    useEffect(() => {
        if (error) {
            if (typeof error === "string")
                toast({ description: error, variant: "destructive" });
            else if (error.fieldErrors) {
                const { email, password, username } = error.fieldErrors;
                if (email || password || username)
                    toast({
                        description: `${email ? email[0] + "\n" : ""}${
                            password ? password[0] + "\n" : ""
                        }${username ? username[0] : ""}
                        `,
                        variant: "destructive",
                        style: { whiteSpace: "pre-line" },
                    });
            }
        }
    }, [error]);
    return (
        <Card className="xs:w-[350px] mb-4">
            <CardHeader className="pb-2">
                <CardTitle>Welcome!</CardTitle>
                <CardDescription>Register to RemixBlog</CardDescription>
            </CardHeader>
            <CardContent>
                <Form action="/auth/google" method="post">
                    <Button className="w-full mb-4">
                        Register with <FcGoogle className="text-2xl ml-2" />
                    </Button>
                </Form>
                <Separator className="mb-2" />

                <Form method="post">
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="username">
                                Username
                                {/* <div className="text-red-600 py-1">
                                    {usernameError}
                                </div> */}
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
                                {/* <div className="text-red-600 py-1">
                                    {emailError}
                                </div> */}
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
                                {/* <div className="text-red-600 py-1">
                                    {passwordError}
                                </div> */}
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
                    <Button
                        disabled={navigation.state !== "idle"}
                        type="submit"
                        className="mt-4"
                    >
                        Register
                    </Button>
                </Form>
            </CardContent>
            <CardFooter className="flex items-center text-muted-foreground">
                <span>Already have an account? </span>
                <Link to="/login">
                    <Button variant="link">Login</Button>
                </Link>
            </CardFooter>
        </Card>
    );
};

export default Register;

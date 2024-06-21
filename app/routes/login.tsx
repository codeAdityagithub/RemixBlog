import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction,
    json,
} from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

import { AuthorizationError } from "remix-auth";
import { ZodError } from "zod";
import { authenticator } from "~/auth.server";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
// import { ZodError } from "zod";
// import { commitSession, getSession } from "~/session.server";
import { useToast } from "~/components/ui/use-toast";
import { ratelimitHeaders } from "~/utils/ratelimit.server";

export const meta: MetaFunction = () => {
    return [
        { title: "RemixBlog | Login" },
        { name: "description", content: "Welcome to RemixBlog" },
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    await authenticator.isAuthenticated(request, {
        successRedirect: "/dashboard",
    });
    return {};
    // let session = await getSession(request.headers.get("Cookie"));
    // let error = session.get(authenticator.sessionErrorKey);
    // if (error?.message) error = JSON.parse(error.message);
    // return json(
    //     { error },
    //     {
    //         headers: {
    //             "Set-Cookie": await commitSession(session), // You must commit the session whenever you read a flash
    //         },
    //     }
    // );
}
export async function action({ request }: ActionFunctionArgs) {
    const redirectTo = new URL(request.url).searchParams.get("redirectTo");
    try {
        const { left } = await ratelimitHeaders(
            "login",
            request.headers,
            60,
            3
        );
        if (left === 0)
            return json(
                { error: "Too many login attempts, try again later." },
                { status: 429 }
            );
        const res = await authenticator.authenticate("user-pass", request, {
            successRedirect: redirectTo ?? "/dashboard",
            // failureRedirect: "/login",
        });
        return res;
    } catch (error) {
        if (error instanceof Response) return error;
        if (error instanceof AuthorizationError) {
            if (error.cause instanceof ZodError) {
                // console.log(error.cause.flatten());
                return json({ error: error.cause.flatten() }, { status: 400 });
            }
            return json({ error: error.message }, { status: 400 });
        }
        console.log(error);
        return { error: "Something went wrong!" };
    }
}

const Login = () => {
    const error = useActionData<typeof action>();
    const navigation = useNavigation();
    const { toast } = useToast();
    useEffect(() => {
        if (error && error.error) {
            if (typeof error.error === "string")
                toast({ description: error.error, variant: "destructive" });
            else if (error.error.fieldErrors) {
                const { email, password } = error.error.fieldErrors;
                if (email || password)
                    toast({
                        description: `${email ? email[0] + " \n" : ""}${
                            password ? password[0] : ""
                        }`,
                        variant: "destructive",
                        style: { whiteSpace: "pre-line" },
                    });
            }
        }
    }, [error]);
    return (
        <Card className="xs:w-[350px] mb-4">
            <CardHeader className="pb-2">
                <CardTitle>Welcome Back!</CardTitle>
                <CardDescription>Login to see your account</CardDescription>
            </CardHeader>
            <CardContent>
                <Form action="/auth/google" method="post">
                    <Button className="w-full mb-4">
                        Login with <FcGoogle className="text-2xl ml-2" />
                    </Button>
                </Form>
                <Separator className="mb-2" />
                <Form method="post">
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="someone@example.com"
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                required
                                name="password"
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
                        Login
                    </Button>
                </Form>
            </CardContent>
            <CardFooter className="flex items-center text-muted-foreground">
                <span>New to RemixBlog? </span>
                <Link to="/register">
                    <Button variant="link">Register</Button>
                </Link>
            </CardFooter>
        </Card>
    );
};

export default Login;

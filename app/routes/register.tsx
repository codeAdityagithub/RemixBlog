import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import React, { useEffect, useRef } from "react";
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
import { ratelimitHeaders } from "~/utils/ratelimit.server";
import {
    EmailLimitExceededError,
    sendVerificationEmail,
} from "~/utils/nodemailer.server";
import { Users } from "~/models/Schema.server";
import { connect } from "~/db.server";
import ratelimitCache from "~/utils/rateLimitRedis.server";

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
    if (form.get("password") !== form.get("confirmPassword"))
        return json({ error: "Passwords don't match." });

    try {
        await connect();

        const { username, email, password } = RegisterFormSchema.parse({
            username: form.get("username"),
            email: form.get("email"),
            password: form.get("password"),
        });
        // const user = await register(username, email, password);
        const user = await Users.findOne({ $or: [{ email }, { username }] });
        if (user)
            return json(
                {
                    error: "User already exists! Login or try a different username or email",
                },
                { status: 406 }
            );
        const { left } = await ratelimitHeaders(
            "register",
            request.headers,
            10,
            1
        );

        if (left === 0)
            return json(
                { error: "Too many registration attempts!" },
                { status: 429 }
            );
        await sendVerificationEmail(username, email, password);

        return {
            message:
                "Verification email sent successfully! Please check your email and click on verify button. ",
        };
    } catch (error: any) {
        if (error instanceof ZodError) {
            return json({ error: error.flatten() }, { status: 400 });
        }
        if (error instanceof Response) return error;
        if (error instanceof EmailLimitExceededError)
            return json({ error: error.message }, { status: 429 });

        console.log(error);
        return json({ error: "Something went wrong" }, { status: 500 });
    }
}

const Register = () => {
    const data = useActionData<typeof action>();
    const navigation = useNavigation();
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    useEffect(() => {
        const error = data?.error;
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
    }, [data]);
    useEffect(() => {
        const message = data?.message;
        if (message) {
            toast({
                description: message,
                className: "bg-green-600 text-white text-lg",
            });
            formRef.current?.reset();
        }
    }, [data?.message]);
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

                <Form ref={formRef} method="post">
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                required
                                type="text"
                                placeholder="Your username"
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email </Label>
                            <Input
                                id="email"
                                name="email"
                                required
                                type="email"
                                placeholder="someone@example.com"
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">Password </Label>
                            <Input
                                id="password"
                                name="password"
                                required
                                type="password"
                                placeholder="Your password"
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="confirmPassword">
                                Confirm Password{" "}
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                type="password"
                                placeholder="Confirm your password"
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

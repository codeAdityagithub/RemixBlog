import { CheckCircledIcon } from "@radix-ui/react-icons";
import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    json,
    redirect,
} from "@remix-run/node";
import {
    Form,
    Link,
    useActionData,
    useLoaderData,
    useNavigation,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import jwt from "jsonwebtoken";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import invariant from "tiny-invariant";
import { RegisterFormSchema } from "~/lib/zod";
import { register } from "~/models/functions.server";
import { authenticator } from "~/auth.server";
import { useEffect } from "react";
import { useToast } from "~/components/ui/use-toast";
import { connect } from "~/db.server";
import { Users } from "~/models/Schema.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticator.isAuthenticated(request, {
        successRedirect: "/dashboard",
    });

    const token = new URL(request.url).searchParams.get("token");
    if (!token) return redirect("/");
    invariant(process.env.JWT_SECRET);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded);
        const { data, success } = RegisterFormSchema.safeParse(decoded);
        if (!success) return json({ error: "Invalid Token" }, { status: 403 });
        await connect();
        const dbuser = await Users.findOne({
            email: data.email,
            username: data.username,
        });
        if (dbuser) return redirect("/");
        return { error: null };
    } catch (err: any) {
        if (err.message === "jwt expired")
            return json({ error: "The Link has expired." }, { status: 406 });
        return json({ error: "Invalid Token." }, { status: 401 });
    }
};
export const action = async ({ request }: ActionFunctionArgs) => {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) return json({ error: "No token povided." }, { status: 400 });
    invariant(process.env.JWT_SECRET);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { data, success } = RegisterFormSchema.safeParse(decoded);
        if (!success) return json({ error: "Invalid Token" }, { status: 403 });
        await connect();
        try {
            const user = await register(
                data.username,
                data.email,
                data.password
            );

            if (!user) return redirect("/login");
            const form = new FormData();
            form.append("email", data.email);
            form.append("password", data.password);
            return await authenticator.authenticate("user-pass", request, {
                context: { formData: form },
                successRedirect: "/dashboard",
                failureRedirect: "/login",
            });
        } catch (error) {
            if (error instanceof Response) return error;
            console.log(error);
            return json({ error: "Something went wrong" }, { status: 500 });
        }
    } catch (err: any) {
        if (err.message === "jwt expired")
            return json({ error: "The Link has expired." }, { status: 406 });
        return json({ error: "Invalid Token." }, { status: 401 });
    }
};

const verifyEmail = () => {
    const { error } = useLoaderData<typeof loader>();
    const data = useActionData<typeof action>();
    const navigation = useNavigation();
    const { toast } = useToast();
    // console.log(error);
    useEffect(() => {
        if (data?.error) {
            toast({ description: data.error, variant: "destructive" });
        }
    }, [data]);
    return !error ? (
        <Card className="w-full xs:w-[350px]">
            <CardHeader>
                <CardTitle className="text-center text-green-600">
                    Email Verified Succesfully{" "}
                    <CheckCircledIcon className="inline w-6 h-6" />
                </CardTitle>
                <CardDescription className="text-center">
                    Please click this link to create your account on RemixBlog.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form method="POST" className="w-fit mx-auto">
                    <Button
                        type="submit"
                        disabled={navigation.state !== "idle"}
                    >
                        {navigation.state === "submitting"
                            ? "Creating Account.."
                            : "Create an Account"}
                    </Button>
                </Form>
            </CardContent>
            <CardFooter>
                <small className="text-center text-muted-foreground">
                    If you did not signup on RemixBlog, then please do not click
                    this link.
                </small>
            </CardFooter>
        </Card>
    ) : (
        <Card className="w-full xs:w-[350px]">
            <CardHeader>
                <CardTitle className="text-center text-red-500">
                    {error}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-4">
                <Link to="/">
                    <Button>Home</Button>
                </Link>
                <Link to="/register">
                    <Button variant="outline">Register</Button>
                </Link>
            </CardContent>

            <CardFooter>
                <small className="text-center text-muted-foreground">
                    If you did not signup on RemixBlog, then ignore this
                    message.
                </small>
            </CardFooter>
        </Card>
    );
};
export default verifyEmail;

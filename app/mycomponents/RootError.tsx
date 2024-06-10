import { Link } from "@remix-run/react";
import React from "react";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";

type Props = {
    error: any;
};

const RootError = ({ error }: Props) => {
    return (
        <div className="grid place-items-center h-screen">
            <Card>
                <CardHeader>
                    <CardTitle>OOPS! </CardTitle>
                    <CardDescription>Something went wrong</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>
                        {" "}
                        {error?.status ?? ""}{" "}
                        {error?.statusText ?? "Something went wrong"}
                    </p>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={() => {
                            window.location.reload();
                        }}
                        size="sm"
                        variant="outline"
                    >
                        Refresh
                    </Button>
                    <Link to="/">
                        <Button size="sm">Home Page</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RootError;

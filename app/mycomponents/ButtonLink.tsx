import { Link } from "@remix-run/react";
import React from "react";
import { Button } from "~/components/ui/button";

type Props = {
    children: React.ReactNode;
    to: string;
};

const ButtonLink = ({ children, to }: Props) => {
    return (
        <Button>
            <Link to={to}>{children}</Link>
        </Button>
    );
};

export default ButtonLink;

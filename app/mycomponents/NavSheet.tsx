import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";
import { TypographyH1 } from "~/components/Typography";
import { Button } from "~/components/ui/button";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetClose,
} from "~/components/ui/sheet";

export default function NavSheet() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden mr-auto"
                >
                    <HamburgerMenuIcon />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                    <TypographyH1>RemixBlog</TypographyH1>
                    <Link
                        to="/"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <SheetClose>Home</SheetClose>
                    </Link>
                    <Link
                        to="/blogs"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <SheetClose>Blogs</SheetClose>
                    </Link>
                    <Link
                        to="/dashboard"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <SheetClose>Dashboard</SheetClose>
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    );
}

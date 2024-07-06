import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { HamburgerMenuIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Link, NavLink, useLocation } from "@remix-run/react";
import { TypographyH1 } from "~/components/Typography";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "~/components/ui/sheet";
import TransitionNavlink from "./TransitionNavlink";

export default function NavSheet() {
  const { pathname } = useLocation();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden mr-auto min-w-9"
        >
          <HamburgerMenuIcon />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="grid gap-4 text-lg font-medium">
          <h1 className="text-3xl font-bold tracking-tight">RemixBlog</h1>
          <SheetClose asChild>
            <TransitionNavlink
              to="/"
              className="text-muted-foreground hover:text-foreground py-2"
            >
              Home
            </TransitionNavlink>
          </SheetClose>
          <SheetClose asChild>
            <TransitionNavlink
              to="/blogs"
              className="text-muted-foreground hover:text-foreground py-2"
            >
              Blogs
            </TransitionNavlink>
          </SheetClose>
          <SheetClose asChild>
            <TransitionNavlink
              to="/dashboard"
              className="text-muted-foreground hover:text-foreground py-2"
            >
              Dashboard
            </TransitionNavlink>
          </SheetClose>
          <div className="flex items-center gap-4 py-2">
            <span className="text-muted-foreground">Toggle Theme</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className=""
                  variant="ghost"
                  size="icon"
                >
                  <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="p-0">
                  <Link
                    className="px-2 py-1.5 w-full h-full"
                    to={`/changeTheme?theme=light&redirect=${pathname}`}
                  >
                    Light
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <Link
                    className="w-full h-full px-2 py-1.5"
                    to={`/changeTheme?theme=dark&redirect=${pathname}`}
                  >
                    Dark
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <SheetClose asChild>
              <Link to={`/login?redirectTo=${pathname}`}>
                <Button>Login</Button>
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link to={`/register?redirectTo=${pathname}`}>
                <Button variant="outline">Register</Button>
              </Link>
            </SheetClose>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

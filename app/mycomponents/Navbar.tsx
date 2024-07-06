import { AvatarFallback } from "@radix-ui/react-avatar";
import { AvatarIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Form, Link, useLocation } from "@remix-run/react";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "~/components/ui/navigation-menu";
import { useUser } from "~/utils/general";
import BlogsSearch from "./BlogsSearch";
import NavSheet from "./NavSheet";
import ProfileDialog from "./ProfileDialog";
import Notifications from "./Notifications";
import TransitionNavlink from "~/mycomponents/TransitionNavlink";
import TransitionLink from "./TransitionLink";

type Props = {};

const Navbar = (props: Props) => {
  const { pathname } = useLocation();
  const user = useUser();
  return (
    <NavigationMenu className="sticky bg-background top-0 min-w-full justify-between gap-4 py-2 h-14 pr-4 pl-0 md:px-6 border-b border-border">
      {/* dekstop  */}
      <NavigationMenuList className="gap-10 hidden md:flex">
        <NavigationMenuItem className="">
          <h1 className="font-bold text-lg">
            <Link to="/">RemixBlog</Link>
          </h1>
        </NavigationMenuItem>
        <div className="flex-1 flex gap-3">
          <NavigationMenuItem>
            <TransitionNavlink to="/">Home</TransitionNavlink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <TransitionNavlink
              to="/blogs"
              prefetch="intent"
            >
              Blogs
            </TransitionNavlink>
          </NavigationMenuItem>
          {user && (
            <NavigationMenuItem>
              <TransitionNavlink
                to="/dashboard"
                prefetch="intent"
              >
                Dashboard
              </TransitionNavlink>
            </NavigationMenuItem>
          )}
        </div>
      </NavigationMenuList>
      {/* mobile  */}
      <NavSheet />
      <BlogsSearch />
      <NavigationMenuList className="gap-2 justify-between">
        {user ? (
          <>
            <Notifications />
            <NavigationMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center">
                  <Avatar>
                    <AvatarImage
                      alt={user.username}
                      src={user.picture}
                      width={40}
                      height={40}
                    ></AvatarImage>
                    <AvatarFallback>
                      <AvatarIcon className="w-full h-full p-1"></AvatarIcon>
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="space-y-1">
                  <DropdownMenuLabel>
                    {user.username}
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <ProfileDialog />
                  {/* <DropdownMenuItem asChild> */}
                  <Button
                    size="sm"
                    asChild
                    variant="ghost"
                    className="w-full font-normal hover:bg-secondary/80 justify-start"
                  >
                    <TransitionLink to={"/profiles/" + user.username}>
                      View profile
                    </TransitionLink>
                    {/* </DropdownMenuItem> */}
                  </Button>
                  <DropdownMenuItem
                    asChild
                    className="p-0"
                  >
                    <Form
                      action={`/logout?redirectTo=${pathname}`}
                      method="post"
                      className="w-full"
                    >
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full justify-start"
                        variant="destructive"
                      >
                        Logout
                      </Button>
                    </Form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </NavigationMenuItem>
          </>
        ) : (
          <>
            <NavigationMenuItem
              className="hidden xs:flex"
              asChild
            >
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem
              className="hidden sm:flex"
              asChild
            >
              <Link to="/register">
                <Button variant="outline">Register</Button>
              </Link>
            </NavigationMenuItem>
          </>
        )}
        <NavigationMenuItem className="hidden sm:flex">
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
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navbar;

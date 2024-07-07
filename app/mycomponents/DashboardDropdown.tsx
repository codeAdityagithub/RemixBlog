import { NavLink, useLocation } from "@remix-run/react";
import { FaSearch } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";
import DashboardBlogSearch from "./DashboardBlogSearch";
import TransitionNavlink from "./TransitionNavlink";

type Props = {};

const DashboardDropdown = (props: Props) => {
  const isDashboard = useLocation().pathname.endsWith("/blogs");
  // console.log(isDashboard);
  return (
    <>
      <div className="hidden md:flex flex-row gap-2 items-end justify-center md:justify-start h-10 px-2 md:px-6 border-b w-full">
        <Button
          size="sm"
          asChild
          variant="ghost"
          className="hover:bg-secondary/60"
        >
          <TransitionNavlink
            prefetch="intent"
            to="/dashboard"
            end
            className="tablink"
            querySelector="#dashboardOutlet"
          >
            Dashboard
          </TransitionNavlink>
        </Button>
        <Button
          size="sm"
          asChild
          variant="ghost"
          className="hover:bg-secondary/60"
        >
          <TransitionNavlink
            prefetch="intent"
            to="/dashboard/new"
            className="tablink"
            querySelector="#dashboardOutlet"
          >
            New Blog
          </TransitionNavlink>
        </Button>
        <Button
          size="sm"
          asChild
          variant="ghost"
          className="hover:bg-secondary/60"
        >
          <TransitionNavlink
            prefetch="intent"
            to="/dashboard/blogs"
            className="tablink"
            querySelector="#dashboardOutlet"
          >
            My Blogs
          </TransitionNavlink>
        </Button>
        <Button
          size="sm"
          asChild
          variant="ghost"
          className="hover:bg-secondary/60"
        >
          <TransitionNavlink
            prefetch="intent"
            to="/dashboard/following"
            className="tablink"
            querySelector="#dashboardOutlet"
          >
            Following
          </TransitionNavlink>
        </Button>
        <Button
          size="sm"
          asChild
          variant="ghost"
          className="hover:bg-secondary/60"
        >
          <TransitionNavlink
            prefetch="intent"
            to="/dashboard/myspace"
            className="tablink"
            querySelector="#dashboardOutlet"
          >
            My Space
          </TransitionNavlink>
        </Button>
        {isDashboard ? <DashboardBlogSearch /> : null}
      </div>
      <div className="md:hidden flex flex-row items-center justify-end gap-4 px-4 md:px-8 h-10 border-b">
        {isDashboard ? <DashboardBlogSearch /> : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
            >
              <BsThreeDots />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-w-[150px] space-y-1">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Button
              size="sm"
              asChild
              variant="ghost"
              className="w-full hover:bg-secondary/60 justify-start"
            >
              <TransitionNavlink
                to="/dashboard"
                end
                className="tablink"
                querySelector="#dashboardOutlet"
              >
                Dashboard
              </TransitionNavlink>
            </Button>
            <Button
              size="sm"
              asChild
              variant="ghost"
              className="w-full hover:bg-secondary/60 justify-start"
            >
              <TransitionNavlink
                to="/dashboard/new"
                className="tablink"
                querySelector="#dashboardOutlet"
              >
                New Blog
              </TransitionNavlink>
            </Button>
            <Button
              size="sm"
              asChild
              variant="ghost"
              className="w-full hover:bg-secondary/60 justify-start"
            >
              <TransitionNavlink
                to="/dashboard/blogs"
                className="tablink"
                querySelector="#dashboardOutlet"
              >
                Your Blogs
              </TransitionNavlink>
            </Button>
            <Button
              size="sm"
              asChild
              variant="ghost"
              className="w-full hover:bg-secondary/60 justify-start"
            >
              <TransitionNavlink
                to="/dashboard/following"
                className="tablink"
                querySelector="#dashboardOutlet"
              >
                Following
              </TransitionNavlink>
            </Button>
            <Button
              size="sm"
              asChild
              variant="ghost"
              className="w-full hover:bg-secondary/60 justify-start"
            >
              <TransitionNavlink
                to="/dashboard/myspace"
                className="tablink"
                querySelector="#dashboardOutlet"
              >
                My Space
              </TransitionNavlink>
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default DashboardDropdown;

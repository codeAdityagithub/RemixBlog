import { Outlet } from "@remix-run/react";

const blogs = () => {
  return (
    <div
      id="blogOutlet"
      className="w-full p-0 sm:px-4 flex flex-1 items-start justify-center h-[calc(100svh-58px)] max-h-[calc(100svh-58px)] overflow-auto ver_scroll"
    >
      <Outlet />
    </div>
  );
};

export default blogs;

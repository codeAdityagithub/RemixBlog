import { Outlet } from "@remix-run/react";

const blogs = () => {
    return (
        <div className="container p-4 flex flex-1 items-start justify-center h-[calc(100vh-58px)] max-h-[calc(100vh-58px)] overflow-auto ver_scroll">
            <Outlet />
        </div>
    );
};

export default blogs;

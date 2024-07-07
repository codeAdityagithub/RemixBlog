import DashboardComments from "~/mycomponents/DashboardComments";
import LikedBlogs from "~/mycomponents/DashboardLikedBlogs";

const MySpace = () => {
  return (
    <div className="w-full grid grid-cols-6 place-content-start gap-8 p-2">
      <DashboardComments mine />
      <LikedBlogs />
    </div>
  );
};
export default MySpace;

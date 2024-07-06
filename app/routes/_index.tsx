import {
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "RemixBlog" },
    { name: "description", content: "Welcome to RemixBlog" },
  ];
};

export const loader = async ({}: LoaderFunctionArgs) => {
  return redirect("/blogs");
};

export default function Index() {
  return (
    <div>
      <h1>Welcome to RemixBlog</h1>
    </div>
  );
}

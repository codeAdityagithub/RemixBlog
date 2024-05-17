import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    json,
    redirect,
} from "@remix-run/node";
import { useLoaderData, useFetcher, useActionData } from "@remix-run/react";
import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import invariant from "tiny-invariant";
import { ZodError } from "zod";
import { authenticator } from "~/auth.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { connect } from "~/db.server";
import { NewBlogSchema } from "~/lib/zod";
import { BlogDocument, Blogs, Content } from "~/models/Schema.server";
import { deleteBlog } from "~/models/functions.server";
import ContentItemwChange from "~/mycomponents/ContentItemwChange";
import DeleteButtonwDialog from "~/mycomponents/DeleteButtonwDialog";
import useInitialForm from "~/mycomponents/hooks/useInitialForm";
import {
    destructiveToastStyle,
    parseNewBlog,
    parseZodBlogError,
    successToastStyle,
} from "~/utils/general";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    const { blogId } = params;
    invariant(blogId, "No blogId specified");
    await connect();
    const blog = (await Blogs.findOne({
        author: user._id,
        _id: blogId,
    })) as BlogDocument | null;

    if (!blog)
        throw json("Blog Not Found", {
            status: 404,
            statusText: "Requested blog not found",
        });
    return { blog };
};

export async function action({ request, params }: ActionFunctionArgs) {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    const { blogId } = params;
    invariant(blogId);
    if (request.method === "DELETE") {
        await deleteBlog(blogId, user._id);
        return redirect("/dashboard/blogs");
    }
    const blog = await request.formData();
    const parsed = parseNewBlog(blog);
    try {
        // console.log(parsed);
        const updatedBlog = NewBlogSchema.parse(parsed);
        // console.log(updatedBlog);
        await connect();
        await Blogs.updateOne(
            {
                author: user._id,
                _id: blogId,
            },
            updatedBlog
        );
        // console.log(dbBlog);
        return { error: null };
    } catch (error: any) {
        if (error instanceof ZodError) {
            return json(parseZodBlogError(error), { status: 400 });
        }
        return json(
            { error: { message: "Something went wrong" } },
            { status: 500 }
        );
    }
}

const DashboardBlogEdit = () => {
    const initialBlog = useLoaderData<typeof loader>()
        .blog as unknown as BlogDocument;
    const [content, setContent] = useState(
        Array.from({ length: initialBlog.content.length })
    );
    const fetcher = useFetcher({ key: initialBlog.updatedAt.toString() });
    const { formData, handleChange, setFormData, hasChanged } =
        useInitialForm(initialBlog);
    const disabled = !hasChanged || fetcher.state === "submitting";
    const res = fetcher.data as any;
    useEffect(() => {
        // console.log(fetcher.data);
        setFormData(initialBlog);
        if (res?.error?.message)
            toast.error(res?.error?.message, {
                style: destructiveToastStyle,
            });
        else if (res?.error === null) {
            toast.success("Blog Updated Successfully", {
                style: successToastStyle,
            });
        }
        // console.log(res);
    }, [initialBlog, fetcher]);
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // console.log("submitted");
        fetcher.submit(e.currentTarget, {
            method: "POST",
        });
    };

    function addMore() {
        if (content.length >= 5) return;
        setContent((prev) => [...prev, 0]);
        setFormData((prev) => ({
            ...prev,
            content: [...prev.content, { heading: "", content: "", image: "" }],
        }));
    }
    function deleteContent(index: number) {
        setContent((prev) => prev.filter((_, ind) => index !== ind));
        setFormData((prev) => ({
            ...prev,
            content: prev.content.filter((_, ind) => index !== ind),
        }));
    }
    return (
        <form onSubmit={handleSubmit} className="container max-w-3xl flex-1">
            {/* <ScrollArea> */}
            <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="title">
                        Title{" "}
                        <span className="text-red-500">
                            {res?.error?.title}
                        </span>
                    </Label>
                    <Input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Title of your blog"
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="desc">
                        Description{" "}
                        <span className="text-red-500">{res?.error?.desc}</span>
                    </Label>
                    <Textarea
                        id="desc"
                        required
                        value={formData.desc}
                        onChange={handleChange}
                        name="desc"
                        placeholder="Your desc"
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="thumbnail">
                        Thumbnail{" "}
                        <span className="text-red-500">
                            {res?.error?.thumbnail}
                        </span>
                    </Label>
                    <Input
                        id="thumbnail"
                        required
                        name="thumbnail"
                        value={formData.thumbnail}
                        onChange={handleChange}
                        type="text"
                        placeholder="Link to your blog thumbnail"
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="content1">Content</Label>
                    <div className="p-2 pl-6 md:pl-10">
                        {content.map((_, ind) => (
                            <ContentItemwChange
                                key={ind}
                                index={ind}
                                deleteContent={deleteContent}
                                errors={
                                    res?.error?.content
                                        ? res.error.content[ind]
                                        : undefined
                                }
                                values={formData.content[ind]}
                                handleChange={handleChange}
                            />
                        ))}
                        {content.length < 5 ? (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                onClick={addMore}
                            >
                                Add More
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <Button type="submit" disabled={disabled} className="mt-4">
                    {formData === initialBlog
                        ? "Edit to save changes"
                        : fetcher.state === "submitting"
                        ? "Saving changes..."
                        : "Save changes"}
                </Button>
                {/* </ScrollArea> */}
            </div>
        </form>
    );
};

export default DashboardBlogEdit;

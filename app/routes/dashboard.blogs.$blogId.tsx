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
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { connect } from "~/db.server";
import { NewBlogSchema } from "~/lib/zod";
import { Blogs } from "~/models/Schema.server";
import { deleteBlog } from "~/models/functions.server";
import ContentItemwChange from "~/mycomponents/ContentItemwChange";
import useInitialForm from "~/mycomponents/hooks/useInitialForm";
import {
    destructiveToastStyle,
    parseNewBlog,
    parseZodBlogError,
    successToastStyle,
} from "~/utils/general";
export type InitialBlog = {
    title: string;
    desc: string;
    thumbnail: string;
    content: {
        content: string;
        heading: string;
        image: string;
    }[];
    tags: string[];
};
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
    })) as InitialBlog | null;

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
    const body = await request.formData();
    const parsed = parseNewBlog(JSON.parse(body.entries().next().value[0]));
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
        .blog as unknown as InitialBlog;
    // const [content, setContent] = useState(
    //     Array.from({ length: initialBlog.content.length })
    // );
    const fetcher = useFetcher();
    const { formData, handleChange, setFormData, hasChanged } =
        useInitialForm(initialBlog);
    const disabled = !hasChanged || fetcher.state === "submitting";
    const res = fetcher.data as any;
    useEffect(() => {
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
    }, [initialBlog, res]);
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        fetcher.submit(JSON.stringify(formData), {
            method: "POST",
        });
    };

    function addMore() {
        if (formData.content.length >= 5) return;
        setFormData((prev) => ({
            ...prev,
            content: [...prev.content, { heading: "", content: "", image: "" }],
        }));
    }
    function deleteContent(index: number) {
        setFormData((prev) => ({
            ...prev,
            content: prev.content.filter((_, ind) => index !== ind),
        }));
    }
    const addTag = (val: string) => {
        if (formData.tags.length > 5) return;
        setFormData((prev) => ({
            ...prev,
            tags: [...prev.tags, val],
        }));
    };
    const removeTag = (ind: number) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== ind),
        }));
    };
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
                    <Label htmlFor="tags">
                        Tags{" "}
                        <span className="text-red-500">{res?.error?.tags}</span>
                    </Label>
                    <div className="flex gap-2 glex-wrap">
                        {formData.tags.map((tag, ind) => (
                            <Badge
                                title="delete tag"
                                onClick={() => removeTag(ind)}
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    {formData.tags.length >= 5 ? null : (
                        <Input
                            id="tags"
                            name="tags"
                            type="text"
                            onKeyDown={(e) => {
                                if (
                                    formData.tags.length >= 5 ||
                                    e.currentTarget.value.trim() === ""
                                )
                                    return;

                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addTag(e.currentTarget.value.trim());
                                    e.currentTarget.value = "";
                                }
                            }}
                            onChange={(e) => {
                                if (formData.tags.length >= 5) return;
                                const val = e.target.value,
                                    char = val[val.length - 1];
                                if (val.trim() === "") return;
                                if (char === " " || char === ",") {
                                    addTag(val.slice(0, val.length - 1));
                                    e.target.value = "";
                                }
                            }}
                            placeholder="Tags for your blogs"
                        />
                    )}
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="content1">Content</Label>
                    <div className="p-2 pl-6 md:pl-10">
                        {formData.content.map((c, ind) => (
                            <ContentItemwChange
                                key={ind}
                                index={ind}
                                deleteContent={deleteContent}
                                errors={
                                    res?.error?.content
                                        ? res.error.content[ind]
                                        : undefined
                                }
                                values={c}
                                handleChange={handleChange}
                            />
                        ))}
                        {formData.content.length < 5 ? (
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

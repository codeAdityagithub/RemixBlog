import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction,
    json,
} from "@remix-run/node";
import {
    ClientActionFunctionArgs,
    Link,
    useFetcher,
    useLoaderData,
    useParams,
} from "@remix-run/react";
import { useEditor } from "@tiptap/react";
import { FormEvent, useCallback, useEffect } from "react";
import sanitizeHtml from "sanitize-html";
import invariant from "tiny-invariant";
import { ZodError } from "zod";
import { authenticator } from "~/auth.server";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/use-toast";
import { connect } from "~/db.server";
import { NewBlogSchema } from "~/lib/zod";
import { Blogs } from "~/models/Schema.server";
import { deleteBlog } from "~/models/functions.server";
import BlogFormTags from "~/mycomponents/BlogFormTags";
import { editorExtensions } from "~/mycomponents/Editor";
import EditorClient from "~/mycomponents/EditorClient";
import useInitialForm from "~/mycomponents/hooks/useInitialForm";
import { limitImageTags, parseZodBlogError } from "~/utils/general";
import { cachedClientAction } from "~/utils/localStorageCache.client";
export type InitialBlog = {
    title: string;
    desc: string;
    thumbnail: string;
    tags: string[];
};
export const meta: MetaFunction = () => {
    return [
        { title: "RemixBlog | Edit Blog" },
        {
            name: "description",
            content: "Edit your blogs quickly and easily",
        },
    ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    const { blogId } = params;
    invariant(blogId, "No blogId specified");
    await connect();
    const blog = (await Blogs.findOne(
        {
            author: user._id,
            _id: blogId,
        },
        {
            _id: 0,
            comments: 0,
            likes: 0,
            createdAt: 0,
            updatedAt: 0,
            views: 0,
            author: 0,
        }
    ).lean()) as (InitialBlog & { content: string }) | null;

    if (!blog)
        throw json("Blog Not Found", {
            status: 404,
            statusText: "Requested blog not found",
        });
    const { content, ...blogWithoutContent } = blog;
    return { blog: blogWithoutContent, content };
};

export async function action({ request, params }: ActionFunctionArgs) {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    await connect();
    const { blogId } = params;
    invariant(blogId);
    if (request.method === "DELETE") {
        await deleteBlog(blogId, user._id);
        console.log("deleted");
        return { deleted: true };
    }
    try {
        // console.log(parsed);
        const body = await request.json();

        const updatedBlog = NewBlogSchema.parse(body);
        updatedBlog.content = sanitizeHtml(updatedBlog.content, {
            allowedSchemes: ["http", "https"],
            allowedAttributes: {
                img: ["src", "alt", "width", "height"], // Allow specific attributes for 'img'
            },
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        });
        // console.log(updatedBlog);
        try {
            limitImageTags(updatedBlog.content);
        } catch (error: any) {
            return json(
                {
                    error: {
                        message: error.message ?? "Something went wrong!",
                    },
                },
                { status: 400 }
            );
        }
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
export async function clientAction({
    request,
    serverAction,
}: ClientActionFunctionArgs) {
    if (request.method === "DELETE") {
        return cachedClientAction({
            cacheKeys: [`dashboardBlogs`],
            serverAction,
        });
    }
    return await serverAction();
}

const DashboardBlogEdit = () => {
    const { blog: initialBlog, content: initialContent } =
        useLoaderData<typeof loader>();
    const blogId = useParams().blogId;
    const fetcher = useFetcher();
    const { toast } = useToast();
    const { formData, handleChange, setFormData, hasChanged, setHasChanged } =
        useInitialForm(initialBlog);
    const disabled = !hasChanged || fetcher.state === "submitting";
    const res = fetcher.data as any;
    const editor = useEditor({
        content: initialContent,
        extensions: editorExtensions,
        editorProps: {
            scrollMargin: { top: 5, left: 5, right: 5, bottom: 150 },
        },
        onUpdate() {
            setHasChanged(true);
        },
    });

    useEffect(() => {
        if (res?.error?.message)
            toast({ description: res?.error?.message, variant: "destructive" });
        else if (res?.error === null) {
            toast({
                description: "Blog Updated Successfully",
                className: "bg-green-600 text-white",
            });
        }
        // console.log(res);
    }, [initialBlog, res]);
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if ((editor?.getText().length ?? 0) < 200) {
            toast({
                description: "Content must be atleast 200 characters long",
                variant: "destructive",
            });
            return;
        }
        const html = editor?.getHTML();
        if (!html) {
            toast({
                description: "Something went wrong!",
                variant: "destructive",
            });
            return;
        }
        if (html === initialContent) {
            setHasChanged(false);
            return;
        }
        try {
            limitImageTags(html);
            fetcher.submit(
                { ...formData, content: html },
                {
                    method: "POST",
                    encType: "application/json",
                }
            );
        } catch (error: any) {
            toast({
                description: error.message ?? "Something went wrong",
                variant: "destructive",
            });
        }
    };

    const addTag = useCallback(
        (val: string) => {
            if (formData.tags.length > 5) return;
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, val],
            }));
        },
        [formData.tags]
    );

    const removeTag = useCallback((ind: number) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== ind),
        }));
    }, []);

    return (
        <form
            onSubmit={handleSubmit}
            className="container max-w-3xl flex-1 p-0 sm:px-6"
        >
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
                                key={`tag-${ind}`}
                                onClick={() => removeTag(ind)}
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <BlogFormTags
                        addTag={addTag}
                        formData={formData}
                        setFormData={setFormData}
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="content1">Content</Label>
                    <EditorClient editor={editor} />
                </div>
            </div>
            <div className="mt-4 space-x-4">
                <Button type="submit" disabled={disabled} className="mt-4">
                    {formData === initialBlog
                        ? "Edit to save changes"
                        : fetcher.state === "submitting"
                        ? "Saving changes..."
                        : "Save changes"}
                </Button>
                <Link to={`/blogs/${blogId}`} prefetch="intent">
                    <Button variant="outline">View</Button>
                </Link>
                {/* </ScrollArea> */}
            </div>
        </form>
    );
};

export default DashboardBlogEdit;

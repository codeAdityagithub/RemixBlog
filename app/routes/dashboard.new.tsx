import { Cross1Icon } from "@radix-ui/react-icons";
import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    json,
    redirect,
} from "@remix-run/node";
import { ClientActionFunctionArgs, Form, useFetcher } from "@remix-run/react";
import { useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import BlogFormTags from "~/mycomponents/BlogFormTags";
import { editorExtensions } from "~/mycomponents/Editor";
import EditorClient from "~/mycomponents/EditorClient";
import { isEqual, limitImageTags, parseZodBlogError } from "~/utils/general";
import sanitizeHtml from "sanitize-html";

type Props = {};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticator.isAuthenticated(request, {
        failureRedirect: "/login?redirectTo=/dashboard/new",
    });
    return {};
};
export async function action({ request }: ActionFunctionArgs) {
    // return redirect("/dashboard/new");
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    // console.log(user);
    try {
        const body = await request.json();
        // const parsed = parseNewBlog(body);
        // console.log(blog.get("content"));
        const newBlog = NewBlogSchema.parse(body);
        newBlog.content = sanitizeHtml(newBlog.content, {
            allowedSchemes: ["http", "https"],
            allowedAttributes: {
                img: ["src", "alt", "width", "height"], // Allow specific attributes for 'img'
            },
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        });
        // console.log(newBlog.content);
        try {
            limitImageTags(newBlog.content);
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
        // console.log(newBlog.content);
        await connect();
        const dbblog = await Blogs.create({ ...newBlog, author: user._id });
        // console.log(dbblog);
        return redirect(`/blogs/${dbblog._id.toString()}`, { status: 302 });
    } catch (error: any) {
        if (error instanceof ZodError) {
            return json(parseZodBlogError(error), { status: 400 });
        }
        console.log(error);
        return json(
            { error: { message: "Something went wrong!" } },
            { status: 500 }
        );
    }
}
export async function clientAction({
    request,
    serverAction,
}: ClientActionFunctionArgs) {
    localStorage.removeItem("formData");
    localStorage.removeItem("dashboardBlogs");
    return await serverAction();
}
const InitialBlog = {
    title: "",
    desc: "",
    thumbnail: "",
    tags: [] as string[],
};
export type BlogFormData = typeof InitialBlog & { content?: string };

const CreateNewBlog = (props: Props) => {
    // const [content, setContent] = useState([0]);
    const [formData, setFormData] = useState(InitialBlog);
    // console.log(formData);
    const fetcher = useFetcher();
    const { toast } = useToast();
    const res = fetcher.data as any;
    // console.log(res);
    const loading = fetcher.state === "submitting";
    const formDataRef = useRef(InitialBlog);
    const isSubmittedRef = useRef(false);
    const editor = useEditor({
        extensions: editorExtensions,
        editorProps: {
            scrollMargin: { top: 5, left: 5, right: 5, bottom: 150 },
        },
    });
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    useEffect(() => {
        // Save form data to localStorage on component unmount
        const handleBeforeUnload = (event: any) => {
            // console.log(isSubmitted);
            if (!isSubmittedRef.current && formDataRef.current !== InitialBlog)
                localStorage.setItem(
                    "formData",
                    JSON.stringify({
                        ...formDataRef.current,
                        content: editor?.getHTML(),
                    })
                );
        };
        function setSavedContent() {
            try {
                const localData = JSON.parse(
                    localStorage.getItem("formData") ?? "1"
                );
                if (typeof localData !== "object") return;
                // console.log(typeof localData, typeof InitialBlog);
                const { content, ...rest } = localData;
                if (isEqual(rest, InitialBlog)) {
                    // console.log("first");
                    setFormData(rest);
                    editor?.commands.insertContent(content);
                    toast({
                        description: "Previous progress restored successfully!",
                        className: "bg-green-600 text-primary",
                        duration: 1000,
                    });
                }
            } catch (error) {
                console.log("Invalid formData in local storage");
            }
        }
        setSavedContent();
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            // console.log(fetcher);
            // console.log(editor?.getHTML());

            if (!isSubmittedRef.current && formDataRef.current !== InitialBlog)
                localStorage.setItem(
                    "formData",
                    JSON.stringify({
                        ...formDataRef.current,
                        content: editor?.getHTML(),
                    })
                );
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [editor]);
    useEffect(() => {
        if (res?.error) isSubmittedRef.current = false;
        if (res?.error?.message)
            toast({ description: res?.error?.message, variant: "destructive" });
    }, [res]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormData((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
            }));
        },
        []
    );

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
        <Form
            method="post"
            onSubmit={(e) => {
                e.preventDefault();
                // console.log(formData);
                isSubmittedRef.current = true;
                if ((editor?.getText().length ?? 0) < 200) {
                    toast({
                        description:
                            "Content must be atleast 200 characters long",
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
            }}
            className="container max-w-3xl flex-1  p-0 sm:px-6"
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
                        name="desc"
                        value={formData.desc}
                        onChange={handleChange}
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
                        type="text"
                        value={formData.thumbnail}
                        onChange={handleChange}
                        placeholder="Link to your blog thumbnail"
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="tags">
                        Tags{" "}
                        <span className="text-red-500">{res?.error?.tags}</span>
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                        {formData.tags.map((tag, ind) => (
                            <Badge
                                title="delete tag"
                                key={"tag" + ind}
                                onClick={() => removeTag(ind)}
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                                {tag}
                                <Cross1Icon
                                    width={10}
                                    height={10}
                                    className="ml-2"
                                />
                            </Badge>
                        ))}
                        <BlogFormTags
                            formData={formData}
                            setFormData={setFormData}
                            addTag={addTag}
                        />
                    </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="content1">Content</Label>
                    <EditorClient editor={editor} />
                </div>
            </div>
            <Button type="submit" disabled={loading} className="mt-4">
                {loading ? "Uploading..." : "Upload"}
            </Button>
            {/* </ScrollArea> */}
        </Form>
    );
};

export default CreateNewBlog;

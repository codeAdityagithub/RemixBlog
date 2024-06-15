import { Cross1Icon } from "@radix-ui/react-icons";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { ClientActionFunctionArgs, Form, useFetcher } from "@remix-run/react";
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
import ContentItemwChange from "~/mycomponents/ContentItemwChange";
import { isEqual, parseNewBlog, parseZodBlogError } from "~/utils/general";

type Props = {};

export async function action({ request }: ActionFunctionArgs) {
    // return redirect("/dashboard/new");
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    // console.log(user);
    const body = await request.json();
    const parsed = parseNewBlog(body);
    // console.log(blog.get("content"));
    try {
        const newBlog = NewBlogSchema.parse(parsed);
        await connect();
        const dbblog = await Blogs.create({ ...newBlog, author: user._id });
        // console.log(dbblog);
        return redirect(`/blogs/${dbblog._id.toString()}`, { status: 302 });
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
    localStorage.removeItem("formData");
    localStorage.removeItem("dashboardBlogs");
    return await serverAction();
}
const InitialContent = { content: "", heading: "", image: "" };
const InitialBlog = {
    title: "",
    desc: "",
    thumbnail: "",
    content: [InitialContent],
    tags: [] as string[],
};
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
    // Update the ref whenever formData changes
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
                    JSON.stringify(formDataRef.current)
                );
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        try {
            const localData = JSON.parse(
                localStorage.getItem("formData") ?? "1"
            );
            // console.log(typeof localData, typeof InitialBlog);
            if (
                typeof localData === "object" &&
                isEqual(localData, InitialBlog)
            ) {
                // console.log("first");
                toast({
                    description: "Previous progress restored successfully!",
                    className: "bg-green-600 text-primary",
                    duration: 1000,
                });
                setFormData(localData);
            }
        } catch (error) {
            console.log("Invalid formData in local storage");
        }
        return () => {
            // console.log(fetcher);
            if (!isSubmittedRef.current && formDataRef.current !== InitialBlog)
                localStorage.setItem(
                    "formData",
                    JSON.stringify(formDataRef.current)
                );
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);
    useEffect(() => {
        if (res?.error) isSubmittedRef.current = false;
        if (res?.error?.message)
            toast({ description: res?.error?.message, variant: "destructive" });
    }, [res]);
    function addMore() {
        if (formData.content.length >= 5) return;
        setFormData((prev) => ({
            ...prev,
            content: [...formData.content, InitialContent],
        }));
    }
    const deleteContent = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            content: prev.content.filter((_, ind) => index !== ind),
        }));
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        let name = e.target.name;
        const index = Number(name[name.length - 1]) - 1;
        name = name.slice(0, -1);
        const newContent = [...formData.content];
        newContent[index] = {
            ...newContent[index],
            [name]: e.target.value,
        };
        if (isNaN(index))
            setFormData({ ...formData, [e.target.name]: e.target.value });
        else
            setFormData({
                ...formData,
                content: newContent,
            });
    };
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
        <Form
            method="post"
            onSubmit={(e) => {
                e.preventDefault();
                // console.log(formData);
                isSubmittedRef.current = true;
                fetcher.submit(formData, {
                    method: "POST",
                    encType: "application/json",
                });
            }}
            className="container max-w-3xl flex-1"
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
                    </div>
                    {formData.tags.length >= 5 ? null : (
                        <Input
                            id="tags"
                            name="tags"
                            type="text"
                            onPaste={(e) => {
                                e.preventDefault();
                                const data = e.clipboardData
                                    .getData("Text")
                                    .replace(/#/g, "")
                                    .split(" ")
                                    .splice(0, 5);
                                if (data.length + formData.tags.length <= 5)
                                    setFormData((prev) => ({
                                        ...prev,
                                        tags: [...formData.tags, ...data],
                                    }));
                            }}
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Backspace" &&
                                    e.currentTarget.value === ""
                                ) {
                                    if (formData.tags.length > 0) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            tags: formData.tags.slice(
                                                0,
                                                formData.tags.length - 1
                                            ),
                                        }));
                                    }
                                }
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
                                handleChange={handleChange}
                                errors={
                                    res?.error?.content
                                        ? res.error.content[ind]
                                        : undefined
                                }
                                values={c}
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
            <Button type="submit" disabled={loading} className="mt-4">
                {loading ? "Uploading..." : "Upload"}
            </Button>
            {/* </ScrollArea> */}
        </Form>
    );
};

export default CreateNewBlog;

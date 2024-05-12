import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { authenticator } from "~/auth.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { connect } from "~/db.server";
import { NewBlogSchema } from "~/lib/zod";
import { Blogs, Content } from "~/models/Schema.server";
import ContentItem from "~/mycomponents/ContentItem";
import { parseNewBlog } from "~/utils/general";

type Props = {};

export async function action({ request }: ActionFunctionArgs) {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    // console.log(user);
    const blog = await request.formData();
    const parsed = parseNewBlog(blog);

    try {
        const newBlog = NewBlogSchema.parse(parsed);
        await connect();
        const dbblog = await Blogs.create({ ...newBlog, author: user._id });
        console.log(dbblog);
        return redirect(`/dashboard/${dbblog._id.toString()}`, { status: 302 });
    } catch (error: any) {
        if (error instanceof ZodError) {
            const contentError: any = error.format((issue) => issue.message);
            const arr = Array.from(Object.keys(contentError.content));
            const contentErrors: Content[] = [];
            console.log(arr);
            arr.forEach((item) => {
                if (!isNaN(Number(item))) {
                    const curError = contentError.content[item];
                    contentErrors[Number(item)] = {
                        heading: curError?.heading?._errors,
                        content: curError?.content?._errors,
                        image: curError?.image?._errors,
                    };
                }
            });
            console.log(contentErrors);
            const err = error.flatten();
            // console.log(err);
            return json(
                { error: { ...err.fieldErrors, content: contentErrors } },
                { status: 400 }
            );
        }
        return json({ error: error?.message }, { status: 400 });
    }
}

const CreateNewBlog = (props: Props) => {
    const [content, setContent] = useState([0]);
    const res = useActionData<typeof action>();
    console.log(res?.error);
    function addMore() {
        if (content.length >= 5) return;
        setContent((prev) => [...prev, prev[prev.length - 1] + 1]);
    }
    return (
        <Form
            method="post"
            className="container max-w-3xl flex-1 max-h-[calc(100vh-130px)] overflow-auto ver_scroll"
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
                        placeholder="Link to your blog thumbnail"
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="content1">Content</Label>
                    <div className="p-2 pl-6 md:pl-10">
                        {content.map((item) => (
                            <ContentItem
                                key={item}
                                index={item}
                                setContent={setContent}
                                errors={res?.error?.content[item]}
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
            <Button type="submit" className="mt-4">
                Post
            </Button>
            {/* </ScrollArea> */}
        </Form>
    );
};

export default CreateNewBlog;

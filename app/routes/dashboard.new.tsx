import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

type Props = {};

const CreateNewBlog = (props: Props) => {
    return (
        <Form method="post" className="container max-w-3xl">
            <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        type="text"
                        required
                        placeholder="Title of your blog"
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        required
                        name="description"
                        placeholder="Your description"
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="thumbnail">Thumbnail</Label>
                    <Input
                        id="thumbnail"
                        required
                        name="thumbnail"
                        type="text"
                        placeholder="Blog Thumbnail"
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                        id="content"
                        required
                        name="content"
                        placeholder="Blog Content..."
                    />
                </div>
            </div>
            <Button type="submit" className="mt-4">
                Post
            </Button>
        </Form>
    );
};

export default CreateNewBlog;

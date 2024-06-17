import { ImageIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type Props = {
    callback: (url: string) => void;
};
const CustomPrompt = ({ callback }: Props) => {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
            <DialogTrigger
                className="inline"
                aria-label="Add image"
                title="add Image"
            >
                <ImageIcon />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add an Image</DialogTitle>
                    <DialogDescription>
                        Add an Image to your blog by pasting its url below.
                    </DialogDescription>
                </DialogHeader>
                <form
                    className="flex items-start justify-center sm:justify-start sm:items-center gap-4 flex-wrap "
                    onSubmit={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // @ts-expect-error
                        const inp = e.target[0].value;
                        if (typeof inp !== "string" || inp.trim() === "")
                            return;
                        setTimeout(() => {
                            setOpen(false);
                        }, 200);
                        callback(inp);
                    }}
                >
                    <Input
                        id="imageInput"
                        name="imageInput"
                        type="text"
                        placeholder="Image url"
                        className="flex-1"
                        required
                    />
                    <Button type="submit">Add</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
export default CustomPrompt;

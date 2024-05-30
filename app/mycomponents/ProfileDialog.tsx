import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
// import { create } from "@remix-run/node";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
type Props = {};

const ProfileDialog = (props: Props) => {
    const fetcher = useFetcher<any>();
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (fetcher.data?.message) {
            if (inputRef.current) inputRef.current.value = "";
            setTimeout(() => setOpen(false), 250);
        }
    }, [fetcher.data]);
    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start font-normal"
                >
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when
                        you're done.
                    </DialogDescription>
                </DialogHeader>
                <fetcher.Form
                    className="grid gap-4 py-4"
                    method="POST"
                    action="/api/profile"
                    encType="multipart/form-data"
                >
                    <span className="text-red-500">{fetcher.data?.error}</span>
                    <span className="text-green-500">
                        {fetcher.data?.message}
                    </span>
                    <div className="flex items-center gap-4">
                        <Label
                            htmlFor="picture"
                            className="text-left min-w-fit"
                        >
                            Profile Picture
                        </Label>
                        <Input
                            id="picture"
                            type="file"
                            name="picture"
                            accept="image/*"
                            className="min-w-40"
                            disabled={fetcher.state !== "idle"}
                            required
                            ref={inputRef}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            disabled={fetcher.state !== "idle"}
                            type="submit"
                        >
                            {fetcher.state !== "idle"
                                ? "Saving..."
                                : "Save changes"}
                        </Button>
                    </DialogFooter>
                </fetcher.Form>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileDialog;

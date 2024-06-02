import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";

type Props = {
    disabled: boolean;
    action: () => void;
    label: string;
};

const DeleteButtonwDialog = ({ disabled, action, label }: Props) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete this {label} and you will not be able to recover
                        it.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        disabled={disabled}
                        onClick={action}
                        type="button"
                        variant="destructive"
                    >
                        {disabled ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteButtonwDialog;

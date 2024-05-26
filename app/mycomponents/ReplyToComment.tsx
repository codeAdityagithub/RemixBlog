import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "~/components/ui/accordion";
import { Textarea } from "~/components/ui/textarea";

type Props = {
    commentId: string;
};

const ReplyToComment = ({ commentId }: Props) => {
    const fetcher = useFetcher({ key: commentId });

    return (
        <Accordion className="w-full" type="single" collapsible>
            <AccordionItem className="border-none" value="item-1">
                <AccordionTrigger className="flex justify-end py-2">
                    Reply
                </AccordionTrigger>
                <AccordionContent className="w-full p-2 mt-2">
                    <form method="POST">
                        <Textarea
                            name="replyContent"
                            className="w-full"
                            placeholder="Write your reply here..."
                        />
                        <Button
                            type="submit"
                            className="mt-1"
                            size="sm"
                            variant="outline"
                        >
                            reply
                        </Button>
                    </form>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default ReplyToComment;

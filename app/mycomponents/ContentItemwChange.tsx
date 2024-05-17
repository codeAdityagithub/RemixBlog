import { Cross1Icon } from "@radix-ui/react-icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Content } from "~/models/Schema.server";

type Props = {
    index: number;
    deleteContent: (index: number) => void;
    errors: Content | undefined;
    values: Content;
    handleChange?: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
};

const ContentItemwChange = ({
    index,
    deleteContent,
    errors,
    values,
    handleChange,
}: Props) => {
    return (
        <div className="flex flex-col gap-1.5 mb-6 relative">
            {index !== 0 ? (
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => deleteContent(index)}
                    className="h-8 w-8 absolute top-2 -left-11"
                >
                    <Cross1Icon />{" "}
                </Button>
            ) : null}
            <Label htmlFor={`heading${index + 1}`}>
                Heading {index + 1}{" "}
                <span className="text-red-500">{errors?.heading ?? null}</span>
            </Label>
            <Input
                id={`heading${index + 1}`}
                required
                name={`heading${index + 1}`}
                type="text"
                className="mb-1.5"
                onChange={handleChange}
                value={values.heading}
                placeholder="Link to your blog heading"
            />
            <Label htmlFor={`image${index + 1}`}>
                Image {index + 1}{" "}
                <span className="text-red-500">{errors?.image ?? null}</span>
            </Label>
            <Input
                id={`image${index + 1}`}
                name={`image${index + 1}`}
                type="text"
                className="mb-1.5"
                onChange={handleChange}
                value={values.image}
                placeholder="Link to your blog image"
            />
            <Label htmlFor={`content${index + 1}`}>
                Content {index + 1}{" "}
                <span className="text-red-500">{errors?.content ?? null}</span>
            </Label>
            <Textarea
                id={`content${index + 1}`}
                required
                onChange={handleChange}
                value={values.content}
                name={`content${index + 1}`}
                placeholder="Your content"
            />
        </div>
    );
};

export default ContentItemwChange;

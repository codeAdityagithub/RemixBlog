import { Input } from "~/components/ui/input";
import { BlogFormData } from "~/routes/dashboard.new";

type Props = {
    formData: BlogFormData;
    setFormData: React.Dispatch<React.SetStateAction<BlogFormData>>;
    addTag: (val: string) => void;
};
const BlogFormTags = ({ formData, setFormData, addTag }: Props) => {
    return (
        <>
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
        </>
    );
};
export default BlogFormTags;

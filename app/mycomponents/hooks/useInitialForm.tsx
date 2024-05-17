import { useEffect, useState } from "react";
import { BlogDocument } from "~/models/Schema.server";

interface ReturnValue<T> {
    formData: T;
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    hasChanged: boolean;
}
function useInitialForm(initialData: BlogDocument): ReturnValue<BlogDocument> {
    const [formData, setFormData] = useState(initialData);
    const [hasChanged, setHasChanged] = useState(false);
    useEffect(() => {
        setHasChanged(JSON.stringify(formData) !== JSON.stringify(initialData));
    }, [formData, initialData]);
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        let name = e.target.name;
        const index = Number(name[name.length - 1]) - 1;
        name = name.slice(0, -1);
        const newContent = [...formData.content];
        newContent[index] = { ...newContent[index], [name]: e.target.value };
        if (isNaN(index))
            setFormData({ ...formData, [e.target.name]: e.target.value });
        else
            setFormData({
                ...formData,
                content: newContent,
            });
    };
    return { formData, handleChange, setFormData, hasChanged };
}

export default useInitialForm;

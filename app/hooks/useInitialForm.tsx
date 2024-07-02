import { useCallback, useEffect, useState } from "react";
import { BlogDocument } from "~/models/Schema.server";
import { InitialBlog } from "~/routes/dashboard.blogs.$blogId";

interface ReturnValue<T> {
    formData: T;
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    hasChanged: boolean;
    setHasChanged: React.Dispatch<React.SetStateAction<boolean>>;
}
function useInitialForm(initialData: InitialBlog): ReturnValue<InitialBlog> {
    const [formData, setFormData] = useState(initialData);
    const [hasChanged, setHasChanged] = useState(false);
    useEffect(() => {
        setHasChanged(JSON.stringify(formData) !== JSON.stringify(initialData));
    }, [formData, initialData]);
    useEffect(() => {
        setFormData(initialData); // Reset formData whenever initialData changes
    }, [initialData]);
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        },
        [initialData]
    );
    return { formData, handleChange, setFormData, hasChanged, setHasChanged };
}

export default useInitialForm;

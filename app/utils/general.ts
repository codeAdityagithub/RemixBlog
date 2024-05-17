import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import { ZodError } from "zod";
import { Content } from "~/models/Schema.server";

export const destructiveToastStyle = {
    backgroundColor: "hsl(var(--destructive))",
    color: "hsl(var(--destructive-foreground))",
};
export const successToastStyle = {
    backgroundColor: "hsl(var(--primary))",
    color: "hsl(var(--primary-foreground))",
};
export function useMatchesData(id: string): Record<string, any> | undefined {
    const matchingRoutes = useMatches();
    const route = useMemo(
        () => matchingRoutes.find((route) => route.id === id),
        [matchingRoutes, id]
    );
    // console.log(route);
    return route?.data as Record<string, any>;
}

export function useUser():
    | { _id: string; email: string; username: string }
    | undefined {
    const data = useMatchesData("root");
    if (!data || !data.user) {
        return undefined;
    }
    return data.user;
}

export const parseNewBlog = (
    form: FormData
): {
    title: string;
    desc: string;
    thumbnail: string;
    content: Content[];
} => {
    const title = String(form.get("title"));
    const desc = String(form.get("desc"));
    const thumbnail = String(form.get("thumbnail"));
    let cur = 1;
    const contents: Content[] = [];
    while (cur <= 5) {
        let heading = form.get(`heading${cur}`),
            content = form.get(`content${cur}`),
            image = form.get(`image${cur}`);
        cur += 1;
        if (!heading || !content) continue;
        const obj: Content = {
            heading: String(heading),
            content: String(content),
        };
        if (image) obj.image = String(image);
        contents.push(obj);
    }
    return { title, desc, thumbnail, content: contents };
};

export function createArray(n: number) {
    return Array.from({ length: n }, (_, index) => index);
}

export function parseZodBlogError(error: ZodError) {
    const contentError: any = error.format((issue) => issue.message);
    const contentErrors: Content[] = [];
    // console.log(arr);
    if (contentError.content) {
        const arr = Array.from(Object.keys(contentError.content));
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
    }
    // console.log(contentErrors);
    const err = error.flatten();
    // console.log(err);
    return { error: { ...err.fieldErrors, content: contentErrors } };
}

export function formatTime(input: string): string {
    const inputTime = new Date(input);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const inputDate = inputTime.toDateString();
    const todayDate = today.toDateString();
    const yesterdayDate = yesterday.toDateString();

    if (inputDate === todayDate) {
        // Return the time in "HH:mm" format
        const hours = String(inputTime.getHours()).padStart(2, "0");
        const minutes = String(inputTime.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    } else if (inputDate === yesterdayDate) {
        return "yesterday";
    } else {
        // Return the date in "MM-DD-YYYY" format
        const month = String(inputTime.getMonth() + 1).padStart(2, "0");
        const day = String(inputTime.getDate()).padStart(2, "0");
        const year = inputTime.getFullYear();
        return `${month}-${day}-${year}`;
    }
}

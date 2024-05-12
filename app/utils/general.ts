import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import { Content } from "~/models/Schema.server";

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

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
    | { _id: string; email: string; username: string; picture?: string }
    | undefined {
    const data = useMatchesData("root");
    if (!data || !data.user) {
        return undefined;
    }
    return data.user;
}

export const parseNewBlog = (form: {
    title: string;
    desc: string;
    thumbnail: string;
    content: Content[];
    tags: string[];
}): {
    title: string;
    desc: string;
    thumbnail: string;
    content: Content[];
    tags: string[];
} => {
    const contents = form.content.map((content) =>
        content.image?.trim() === ""
            ? { heading: content.heading, content: content.content }
            : content
    );
    return { ...form, content: contents };
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
export function isEqual(obj1: Object, obj2: Object) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    return keys1.every((key) => keys2.includes(key));
}

// export function isEqualValues(obj1: Object, obj2: Object) {
//     const values1 = Object.values(obj1);
//     const values2 = Object.values(obj2);

//     if (values1.length !== values2.length) {
//         return false;
//     }

//     return values1.every((key) => values2.includes(key));
// }
export function getGreeting() {
    let hour = new Date().getHours();
    if (hour < 12) {
        return "Good Morning";
    } else if (hour < 18) {
        return "Good Afternoon";
    } else {
        return "Good Evening";
    }
}

export function getPaginationRange(
    totalPages: number,
    activePage: number,
    visiblePages = 5
) {
    let startPage, endPage;
    const halfVisible = Math.floor(visiblePages / 2);

    // Calculate the start and end pages
    if (activePage <= halfVisible) {
        // Near the start
        startPage = 1;
        endPage = Math.min(totalPages, visiblePages);
    } else if (activePage + halfVisible >= totalPages) {
        // Near the end
        startPage = Math.max(1, totalPages - visiblePages + 1);
        endPage = totalPages;
    } else {
        // Somewhere in the middle
        startPage = activePage - halfVisible;
        endPage = activePage + halfVisible;
    }

    // Ensure the range includes two previous and two next pages if available
    // if (activePage - startPage < 2) {
    //     endPage = Math.min(
    //         endPage + (2 - (activePage - startPage)),
    //         totalPages
    //     );
    // }
    // if (endPage - activePage < 2) {
    //     startPage = Math.max(1, startPage - (2 - (endPage - activePage)));
    // }

    return Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    );
}

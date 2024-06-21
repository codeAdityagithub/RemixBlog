import z from "zod";

export const LoginFormSchema = z.object({
    email: z.string().email({ message: "Please recheck provided email" }),
    password: z
        .string()
        .min(8, { message: "Password must be atleast 8 characters" })
        .max(50, { message: "Password can be atmost 50 characters" }),
});

export const RegisterFormSchema = z.object({
    username: z
        .string()
        .min(6, { message: "Username must be atleast 6 characters" })
        .max(255, "Username must be atmost 255 characters"),
    email: z.string().email({ message: "Please recheck provided email" }),
    password: z
        .string()
        .min(8, { message: "Password must be atleast 8 characters" })
        .max(50, { message: "Password can be atmost 50 characters" }),
});

export const NewBlogSchema = z.object({
    title: z
        .string()
        .min(3, { message: "Title must be atleast 3 characters." })
        .max(200, { message: "Title cannot be more than 200 chars." }),
    desc: z
        .string()
        .min(10, { message: "Description must be atleast 10 characters." })
        .max(255, { message: "Description can be atmost 255 characters." }),
    thumbnail: z.string().url({
        message: "Thumbnail must be a valid URL.",
    }),
    tags: z
        .array(
            z
                .string()
                .min(3, { message: "Tags must be atleast 3 chars" })
                .max(30, { message: "A tag can be of atmost 30 chars long" })
        )
        .max(5, { message: "A blog can have atmost five tags" }),
    content: z
        .string()
        .min(200, { message: "Content must be at least 200 chars" })
        .max(5000, { message: "Content can be atmost 5000 chars" }),
});

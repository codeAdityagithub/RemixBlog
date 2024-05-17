import z from "zod";
import { Content } from "~/models/Schema.server";

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
        .min(3, { message: "Title must be atleast 3 characters." }),
    desc: z
        .string()
        .min(10, { message: "Description must be atleast 10 characters." })
        .max(255, { message: "Description can be atmost 255 characters." }),
    thumbnail: z
        .string()
        .regex(/\bhttps?:\/\/\S+\.(?:png|jpe?g|gif|svg)\b/g, {
            message: "Thumbnail must be a valid URL.",
        }),
    content: z.array(
        z.object({
            heading: z
                .string()
                .min(3, { message: "Heading must be atleast 3 characters." }),
            image: z.optional(
                z
                    .string()
                    .regex(/\bhttps?:\/\/\S+\.(?:png|jpe?g|gif|svg)\b/g, {
                        message: "Image must be a valid URL.",
                    })
            ),
            content: z.string().min(10, {
                message: "Subcontent must be atleast 10 characters.",
            }),
        })
    ),
});

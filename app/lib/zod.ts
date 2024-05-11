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

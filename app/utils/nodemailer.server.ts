import nodemailer from "nodemailer";
import invariant from "tiny-invariant";
import jwt from "jsonwebtoken";
import { ratelimitIdUpstash } from "./redisCache.server";

invariant(process.env.SMTP_HOST);
invariant(process.env.SMTP_PORT);
invariant(process.env.SMTP_USER);
invariant(process.env.SMTP_PASSWORD);
invariant(process.env.JWT_SECRET);

export class EmailLimitExceededError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EmailLimitExceededError";
    }
}

const transporter = nodemailer.createTransport({
    // @ts-expect-error
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendVerificationEmail(
    username: string,
    toEmail: string,
    password: string
) {
    const { left } = await ratelimitIdUpstash(
        "sendEmail",
        "sendEmail",
        60 * 60 * 24,
        20
    );
    if (left === 0) {
        throw new EmailLimitExceededError(
            "The server cannot send more emails at the moment, please try again later."
        );
    }
    const token = jwt.sign(
        { email: toEmail, password: password, username },
        process.env.JWT_SECRET!,
        {
            expiresIn: "1h",
        }
    );
    const verificationLink =
        process.env.NODE_ENV === "development"
            ? `http://localhost:5173/verify?token=${token}`
            : `https://remixblog-iota.vercel.app/verify?token=${token}`;

    const info = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: toEmail,
        subject: "Verify Your Email - RemixBlog",
        text: `Hello RemixBlog User!\n\nClick the link below to verify your email and complete your registration:\n${verificationLink}\n\nBest Regards,\nAditya from RemixBlog`,
        html: `
        <h1 style="text-align:center; font-family: 'Arial', sans-serif; color:#205fe6; margin-bottom: 20px;">
    RemixBlog
</h1>
<h4 style="text-align:center; font-family: 'Arial', sans-serif; color:#333; margin-bottom: 20px;">
    Hello RemixBlog User!
</h4>
<p style="text-align:center; font-family: 'Arial', sans-serif; color:#555; margin-bottom: 30px;">
    Click the link below to verify your email and complete your registration:
</p>
<p style="text-align:center; margin-bottom: 30px;">
    <a href="${verificationLink}" target="_blank" style="padding: 15px 30px; border-radius: 30px; background-color: #205fe6; color: white; font-size: 18px; text-decoration: none; font-family: 'Arial', sans-serif;">
        Verify Email
    </a>
</p>
<p style="text-align:center; font-family: 'Arial', sans-serif; color:#555;">
    Best Regards,<br>
    <span style="font-weight: bold;">Aditya</span> from RemixBlog
</p>

      `,
    });

    console.log(info);
}

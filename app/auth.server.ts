// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { FormStrategy } from "remix-auth-form";
import { LoginFormSchema } from "./lib/zod";
import { verifyLogin } from "./models/functions.server";
import { connect } from "./db.server";
import { GoogleStrategy } from "remix-auth-google";
import invariant from "tiny-invariant";
import { Users } from "./models/Schema.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
const authenticator = new Authenticator<{
    _id: string;
    username: string;
    email: string;
    picture?: string;
}>(sessionStorage, { throwOnError: true });

invariant(process.env.GOOGLE_CLIENT_ID);
invariant(process.env.GOOGLE_CLIENT_SECRET);
// Tell the Authenticator to use the form strategy
let googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
            process.env.NODE_ENV === "development"
                ? "http://localhost:5173/auth/callback/google"
                : "https://remixblog-iota.vercel.app/auth/callback/google",
    },
    async ({ profile }) => {
        // Get the user data from your DB or API using the tokens and profile
        const { email } = profile._json;
        console.log(profile);
        // if (!email_verified) throw new Error("Email not verified");
        const user = await Users.findOne(
            { email: email },
            { username: 1, email: 1, picture: 1, _id: 1 }
        );

        if (user)
            return {
                _id: user._id.toString(),
                username: user.username,
                email: user.email,
                picture: user.picture,
            };
        // Create a new user in your DB or API
        const dbuser = await Users.create({
            username: profile._json.name,
            email: email,
            picture: profile._json.picture,
        });
        console.log(dbuser);
        const newuser = {
            _id: dbuser._id.toString(),
            username: dbuser.username,
            email: dbuser.email,
            picture: dbuser.picture,
        };
        return newuser;
    }
);

authenticator.use(
    new FormStrategy(async ({ form }) => {
        // console.log("first");
        // console.log(form.get("email"));
        const { email, password } = LoginFormSchema.parse({
            email: form.get("email"),
            password: form.get("password"),
        });
        await connect();
        const user = await verifyLogin(email, password);
        if (!user) throw new Error("Please verify your credentials");
        // console.log(user);
        return user;
    }),
    // each strategy has a name and can be changed to use another one
    // same strategy multiple times, especially useful for the OAuth2 strategy.
    "user-pass"
);
authenticator.use(googleStrategy, "google");

export { authenticator };

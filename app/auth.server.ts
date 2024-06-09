// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { FormStrategy } from "remix-auth-form";
import { LoginFormSchema } from "./lib/zod";
import { verifyLogin } from "./models/functions.server";
import { connect } from "./db.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
const authenticator = new Authenticator<{
    _id: string;
    username: string;
    email: string;
    picture?: string;
}>(sessionStorage, { throwOnError: true });

// Tell the Authenticator to use the form strategy
authenticator.use(
    new FormStrategy(async ({ form }) => {
        // console.log("first");
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

export { authenticator };

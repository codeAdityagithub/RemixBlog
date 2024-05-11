import { connect } from "~/db.server";
import { UserDocument, Users } from "./Schema.server";
import bcrypt from "bcryptjs";

export async function verifyLogin(
    email: string,
    password: string
): Promise<{ _id: string; username: string; email: string } | null> {
    await connect();
    const userWithPassword = await Users.findOne({ email: email });
    if (!userWithPassword || !userWithPassword.password) {
        return null;
    }

    const isValid = await bcrypt.compare(password, userWithPassword.password);

    if (!isValid) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
        password: _password,
        _id,
        email: emai,
        username,
    } = userWithPassword;

    return { _id: _id.toString(), email: emai, username };
}

export async function register(
    username: string,
    email: string,
    password: string
) {
    const user = await Users.findOne({ email });
    if (user) return null;
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await Users.create({
        username: username,
        password: hashedPassword,
        email: email,
    });
    return createdUser;
}

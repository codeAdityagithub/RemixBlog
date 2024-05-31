import { ActionFunctionArgs, json } from "@remix-run/node";
import sharp from "sharp";
import { authenticator } from "~/auth.server";
import { connect } from "~/db.server";
import { Users } from "~/models/Schema.server";
import { commitSession, getSession } from "~/session.server";
import { uploadImage } from "~/utils/cloudinary.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
    // const redirectTo = new URL(request.url).searchParams.get("redirectTo");
    const file = (await request.formData()).get("picture");

    if (
        !(file instanceof File) ||
        !(
            file.type === "image/png" ||
            file.type === "image/jpg" ||
            file.type === "image/jpeg"
        )
    ) {
        return json({ error: "Invalid file type" }, { status: 400 });
    }
    const buffer = await file.arrayBuffer();
    const resizedBuffer = await sharp(buffer)
        .resize(100, 100)
        .jpeg()
        .toBuffer();
    // @ts-expect-error
    const imgSource = (await uploadImage(resizedBuffer, user.username))
        .secure_url;

    if (!imgSource) {
        return json({ error: "Something went wrong" }, { status: 500 });
    }
    try {
        await connect();
        let up = await Users.updateOne(
            { _id: user._id },
            { $set: { picture: imgSource } }
        );
        console.log(await Users.findOne({ _id: user._id }));
    } catch (error) {
        return json({ error: "Something went wrong" }, { status: 500 });
    }
    let session = await getSession(request.headers.get("cookie"));
    // and store the user data
    // console.log(session);
    user.picture = String(imgSource);
    session.set(authenticator.sessionKey, user);

    // commit the session
    let headers = new Headers({ "Set-Cookie": await commitSession(session) });
    return json({ message: "Profile Updated Succesfully!" }, { headers });
};

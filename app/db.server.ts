import invariant from "tiny-invariant";
import mongoose from "mongoose";

invariant(process.env.MONGO_URL);
let isConnected = false;
export async function connect() {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URL!);
        isConnected = true;
    } catch (error: any) {
        console.log(error?.message);
        process.exit(1);
    }
}

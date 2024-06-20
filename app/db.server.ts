import invariant from "tiny-invariant";
import mongoose from "mongoose";

invariant(process.env.MONGO_URL);
let isConnected = false;

export async function connect() {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.MONGO_URL!, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;

        // Setup graceful shutdown
        process.on("SIGINT", async () => {
            await mongoose.disconnect();
        });
        process.on("SIGTERM", async () => {
            await mongoose.disconnect();
        });
    } catch (error: any) {
        console.error(error?.message);
        process.exit(1);
    }
}

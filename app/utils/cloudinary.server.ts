import cloudinary from "cloudinary";
import {
    createReadableStreamFromReadable,
    writeAsyncIterableToWritable,
    writeReadableStreamToWritable,
} from "@remix-run/node";
import sharp from "sharp";
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

async function uploadImage(data: Buffer, name: string) {
    // await sharp(data);
    const uploadPromise = new Promise(async (resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader
            .upload_stream(
                {
                    folder: "remixBlog",
                    allowed_formats: ["jpg", "png", "svg"],
                    // filename_override: name,
                    public_id: name,
                    overwrite: true,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(result);
                }
            )
            .end(data);
        // const stream = new ReadableStream(data.b)
        // writeReadableStreamToWritable(,uploadStream)
    });
    return uploadPromise;
}

export { uploadImage };

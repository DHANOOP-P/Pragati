import { v2 as cloudinary } from "cloudinary";

const configured = () =>
  Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );

export const isCloudinaryReady = configured;

export function initCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    return cloudinary;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export function uploadBuffer(buffer, filename = "image") {
  const api = initCloudinary();
  return new Promise((resolve, reject) => {
    const stream = api.uploader.upload_stream(
      {
        folder: "pragati",
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        filename_override: filename.replace(/\.[^.]+$/, ""),
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

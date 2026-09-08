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

function folderName(folder = "pragati") {
  const cleaned = String(folder || "pragati")
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/^\/+|\/+$/g, "");
  if (!cleaned || cleaned === "pragati") return "pragati";
  return cleaned.startsWith("pragati/") ? cleaned : `pragati/${cleaned}`;
}

export function uploadBuffer(buffer, filename = "image", folder = "pragati") {
  const api = initCloudinary();
  return new Promise((resolve, reject) => {
    const stream = api.uploader.upload_stream(
      {
        folder: folderName(folder),
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
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

export async function listImages({ folder = "pragati", max = 80 } = {}) {
  const api = initCloudinary();
  const result = await api.api.resources({
    type: "upload",
    prefix: `${folderName(folder)}/`,
    max_results: Math.min(100, Number(max) || 80),
    resource_type: "image",
  });
  return (result.resources || []).map((item) => ({
    url: item.secure_url,
    publicId: item.public_id,
    width: item.width,
    height: item.height,
    format: item.format,
    createdAt: item.created_at,
  }));
}

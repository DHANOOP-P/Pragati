import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.join(__dirname, "../../uploads");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function disk(folder) {
  ensureDir(path.join(uploadRoot, folder));
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(uploadRoot, folder)),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^\w.\- ()]/g, "_");
      cb(null, `${Date.now()}-${safe}`);
    },
  });
}

export const uploadCertificates = multer({
  storage: disk("certificates"),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF certificates are allowed"));
    }
  },
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const uploadMedia = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Upload a JPG, PNG, WebP, GIF, or AVIF image"));
    }
  },
  limits: { fileSize: 12 * 1024 * 1024 },
});

export const uploadRootPath = uploadRoot;

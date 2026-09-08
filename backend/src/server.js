import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./config/db.js";
import { seedAdmin, seedCatalog, seedDemoUsers, syncArtsEventMeta, syncFeaturedWorkshops, syncPreEvents, syncProshows, syncHouses } from "./seed.js";
import { uploadRootPath } from "./middleware/upload.js";
import authRoutes from "./routes/auth.js";
import catalogRoutes from "./routes/catalog.js";
import registrationRoutes from "./routes/registrations.js";
import paymentRoutes from "./routes/payments.js";
import certificateRoutes from "./routes/certificates.js";
import adminRoutes from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

function cleanOrigin(value) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/\/+$/, "");
}

function isValidOrigin(value) {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.pathname === "/" && !url.search && !url.hash;
  } catch {
    return false;
  }
}

function allowedOrigin(requestOrigin) {
  const origin = cleanOrigin(requestOrigin);
  if (!origin || !isValidOrigin(origin)) return null;
  const extras = String(process.env.CLIENT_URL || "")
    .split(/[\s,]+/)
    .map(cleanOrigin)
    .filter((value) => isValidOrigin(value));
  if (origin === "http://localhost:5173" || extras.includes(origin)) return origin;
  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol === "https:" && hostname.endsWith(".vercel.app")) return origin;
  } catch {
    return null;
  }
  return null;
}

app.use(
  cors({
    origin(origin, callback) {
      callback(null, allowedOrigin(origin) || false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "8mb" }));
app.use("/uploads", express.static(uploadRootPath));

const API_ALIASES = [
  "/health",
  "/events",
  "/workshops",
  "/proshows",
  "/preevents",
  "/ads",
  "/points",
  "/winners",
  "/service-gates",
  "/auth",
  "/registrations",
  "/payments",
  "/certificates",
  "/admin",
];

app.use((req, _res, next) => {
  const pathOnly = req.url.split("?")[0];
  if (pathOnly === "/api" || pathOnly.startsWith("/api/")) return next();
  if (API_ALIASES.some((prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`))) {
    req.url = `/api${req.url}`;
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "Pragati API" });
});

app.use("/api/auth", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  const origin = allowedOrigin(req.headers.origin);
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.status(500).json({ message: err.message || "Server error" });
});

const port = Number(process.env.PORT || 5000);

await connectDb();
await seedAdmin();
await seedCatalog();
await syncArtsEventMeta();
await syncFeaturedWorkshops();
await syncProshows();
await syncPreEvents();
await syncHouses();
await seedDemoUsers();

app.listen(port, "0.0.0.0", () => {
  console.log(`Pragati API on ${port}`);
});

void __dirname;

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

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const extra = String(process.env.CLIENT_URL || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  if (origin === "http://localhost:5173" || extra.includes(origin)) return true;
  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === "https:" && hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "8mb" }));
app.use("/uploads", express.static(uploadRootPath));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "Pragati API" });
});

app.use("/api/auth", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
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

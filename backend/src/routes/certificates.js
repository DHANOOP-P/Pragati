import { Router } from "express";
import path from "path";
import Certificate from "../models/Certificate.js";
import { protect } from "../middleware/auth.js";
import { publicFileUrl } from "../utils/pdf.js";

const router = Router();

router.get("/me", protect, async (req, res) => {
  const items = await Certificate.find({
    $or: [{ user: req.user._id }, { matched: true, studentName: new RegExp(`^${req.user.name}$`, "i") }],
  }).sort({ createdAt: -1 });

  res.json(
    items.map((c) => ({
      ...c.toObject(),
      downloadUrl: publicFileUrl(c.storedPath),
    }))
  );
});

router.get("/:id/download", protect, async (req, res) => {
  const cert = await Certificate.findById(req.params.id);
  if (!cert) return res.status(404).json({ message: "Certificate not found" });

  const owns =
    String(cert.user || "") === String(req.user._id) ||
    cert.studentName.toLowerCase() === req.user.name.toLowerCase() ||
    req.user.role === "admin";

  if (!owns) return res.status(403).json({ message: "Not allowed" });
  res.download(path.resolve(cert.storedPath), `${cert.studentName}.pdf`);
});

export default router;

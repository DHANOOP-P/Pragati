import { Router } from "express";
import path from "path";
import ArtsEvent from "../models/ArtsEvent.js";
import Workshop from "../models/Workshop.js";
import Proshow from "../models/Proshow.js";
import Ad from "../models/Ad.js";
import Winner from "../models/Winner.js";
import PreEvent from "../models/PreEvent.js";
import House from "../models/House.js";
import { HOUSE_TABLE } from "../utils/studentMeta.js";
import Registration from "../models/Registration.js";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { uploadCertificates, uploadMedia, saveLocalImage, listLocalImages } from "../middleware/upload.js";
import { normalizeName } from "../utils/ticket.js";
import { publicFileUrl } from "../utils/pdf.js";
import { isCloudinaryReady, uploadBuffer, listImages } from "../utils/cloudinary.js";
import { getServiceGates, serializeGates } from "../utils/serviceGates.js";
import { catalogCacheClear } from "../utils/catalogCache.js";

const router = Router();
router.use(protect, adminOnly);

function crud(Model, { onChange } = {}) {
  const r = Router();
  r.get("/", async (_req, res) => res.json(await Model.find().sort({ createdAt: -1 })));
  r.post("/", async (req, res) => {
    const item = await Model.create(req.body);
    onChange?.();
    res.status(201).json(item);
  });
  r.put("/:id", async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    onChange?.();
    res.json(item);
  });
  r.delete("/:id", async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    onChange?.();
    res.json({ ok: true });
  });
  return r;
}

router.use("/events", crud(ArtsEvent));
router.use("/workshops", crud(Workshop, { onChange: () => catalogCacheClear("workshops") }));
router.use("/proshows", crud(Proshow, { onChange: () => catalogCacheClear("proshows") }));
router.use("/ads", crud(Ad));
router.use("/winners", crud(Winner));
router.use("/preevents", crud(PreEvent, { onChange: () => catalogCacheClear("preevents") }));

router.get("/service-gates", async (_req, res) => {
  res.json(serializeGates(await getServiceGates()));
});

router.put("/service-gates", async (req, res) => {
  const doc = await getServiceGates();
  if (typeof req.body?.artsOpen === "boolean") doc.artsOpen = req.body.artsOpen;
  if (typeof req.body?.workshopsOpen === "boolean") doc.workshopsOpen = req.body.workshopsOpen;
  if (typeof req.body?.proshowsOpen === "boolean") doc.proshowsOpen = req.body.proshowsOpen;
  await doc.save();
  res.json(serializeGates(doc));
});

router.get("/points", async (_req, res) => {
  for (const row of HOUSE_TABLE) {
    await House.findOneAndUpdate({ name: row.name }, { $setOnInsert: row }, { upsert: true });
  }
  const houses = await House.find().sort({ order: 1, name: 1 });
  res.json(houses);
});

router.put("/points", async (req, res) => {
  const rows = Array.isArray(req.body?.houses) ? req.body.houses : [];
  const updated = [];
  for (const row of rows) {
    if (!row?._id) continue;
    const patch = {};
    if (row.points != null) patch.points = Math.max(0, Number(row.points) || 0);
    if (row.name != null) {
      const name = String(row.name).trim();
      if (!name) continue;
      const taken = await House.findOne({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"), _id: { $ne: row._id } });
      if (taken) return res.status(409).json({ message: `Category "${name}" already exists` });
      patch.name = name;
    }
    if (row.order != null) patch.order = Number(row.order) || 0;
    if (!Object.keys(patch).length) continue;
    const house = await House.findByIdAndUpdate(row._id, patch, { new: true });
    if (house) updated.push(house);
  }
  const houses = await House.find().sort({ order: 1, name: 1 });
  res.json(houses);
});

router.post("/points", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ message: "Category name is required" });
  const exists = await House.findOne({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
  if (exists) return res.status(409).json({ message: "Category already exists" });
  const maxOrder = await House.findOne().sort({ order: -1 }).select("order");
  const house = await House.create({
    name,
    points: Math.max(0, Number(req.body?.points) || 0),
    order: (maxOrder?.order ?? 0) + 1,
  });
  res.status(201).json(house);
});

router.delete("/points/:id", async (req, res) => {
  const house = await House.findByIdAndDelete(req.params.id);
  if (!house) return res.status(404).json({ message: "Category not found" });
  res.json({ ok: true });
});

function registrationFilter(query) {
  const filter = {};
  if (query.scope === "paid") {
    filter.itemType =
      query.itemType && ["workshop", "proshow"].includes(query.itemType)
        ? query.itemType
        : { $in: ["workshop", "proshow"] };
  } else if (query.scope === "arts") filter.itemType = "arts";
  else if (query.itemType) filter.itemType = query.itemType;
  if (query.itemId) filter.itemId = query.itemId;
  if (query.department) {
    filter.$or = [{ department: query.department }, { "members.department": query.department }];
  }
  return filter;
}

function registrationSort(query) {
  if (query.sort === "event") return { itemTitle: 1, createdAt: -1 };
  if (query.sort === "department") return { department: 1, itemTitle: 1, createdAt: -1 };
  if (query.sort === "name") return { studentName: 1, createdAt: -1 };
  return { createdAt: -1 };
}

function csvCell(value) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

async function listRegistrations(query) {
  const items = await Registration.find(registrationFilter(query))
    .populate("user", "name email phone college studentClass houseName department")
    .sort(registrationSort(query));
  const missing = items.filter((r) => r.itemType === "arts" && !r.participationType);
  const events = missing.length
    ? await ArtsEvent.find({ _id: { $in: missing.map((r) => r.itemId) } }).select("participationType")
    : [];
  const kindById = Object.fromEntries(events.map((e) => [String(e._id), e.participationType]));
  return items.map((r) => {
    const row = r.toObject();
    return {
      ...row,
      participationType: row.participationType || kindById[String(row.itemId)] || "individual",
      studentName: row.studentName || row.user?.name || "",
      studentClass: row.studentClass || row.user?.studentClass || "",
      houseName: row.houseName || row.user?.houseName || "",
      department: row.department || row.user?.department || "",
      phone: row.phone || row.user?.phone || "",
      email: row.email || row.user?.email || "",
      ticketUrl: publicFileUrl(r.ticketPath),
      invoiceUrl: publicFileUrl(r.invoicePath),
    };
  }).filter((row) => !query.participationType || row.participationType === query.participationType);
}

router.get("/stats", async (_req, res) => {
  const [users, events, workshops, proshows, preevents, registrations, artsRegistrations, paidRegistrations, certificates] =
    await Promise.all([
      User.countDocuments({ role: "student" }),
      ArtsEvent.countDocuments(),
      Workshop.countDocuments(),
      Proshow.countDocuments(),
      PreEvent.countDocuments(),
      Registration.countDocuments({ status: "confirmed" }),
      Registration.countDocuments({ status: "confirmed", itemType: "arts" }),
      Registration.countDocuments({ status: "confirmed", itemType: { $in: ["workshop", "proshow"] } }),
      Certificate.countDocuments(),
    ]);
  res.json({
    users,
    events,
    workshops,
    proshows,
    preevents,
    registrations,
    artsRegistrations,
    paidRegistrations,
    certificates,
  });
});

router.get("/students", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const semester = String(req.query.semester || "").trim();
  const studentClass = String(req.query.studentClass || req.query.class || "").trim();
  const department = String(req.query.department || "").trim();
  const filter = { role: "student" };
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { college: rx }, { department: rx }, { houseName: rx }];
  }
  if (semester) filter.semester = new RegExp(`^${semester.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  if (studentClass) filter.studentClass = String(studentClass);
  if (department) filter.department = new RegExp(`^${department.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  const students = await User.find(filter)
    .select("name email phone college studentClass semester houseName department createdAt")
    .sort({ createdAt: -1 });
  res.json(students);
});

router.get("/students/export", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const semester = String(req.query.semester || "").trim();
  const studentClass = String(req.query.studentClass || req.query.class || "").trim();
  const department = String(req.query.department || "").trim();
  const filter = { role: "student" };
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { college: rx }, { department: rx }, { houseName: rx }];
  }
  if (semester) filter.semester = new RegExp(`^${semester.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  if (studentClass) filter.studentClass = String(studentClass);
  if (department) filter.department = new RegExp(`^${department.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  const students = await User.find(filter)
    .select("name email phone college studentClass semester houseName department createdAt")
    .sort({ createdAt: -1 });
  const header = ["Name", "Email", "Phone", "College", "Class", "Semester", "House", "Department", "Signed up"];
  const rows = students.map((s) =>
    [
      s.name,
      s.email,
      s.phone,
      s.college,
      s.studentClass,
      s.semester,
      s.houseName,
      s.department,
      s.createdAt ? new Date(s.createdAt).toISOString() : "",
    ]
      .map((value) => `"${String(value || "").replace(/"/g, '""')}"`)
      .join(",")
  );
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="pragati-students.csv"');
  res.send([header.join(","), ...rows].join("\n"));
});

router.delete("/students/:id", async (req, res) => {
  const student = await User.findOne({ _id: req.params.id, role: "student" });
  if (!student) return res.status(404).json({ message: "Student not found" });
  await User.deleteOne({ _id: student._id });
  res.json({ ok: true });
});

router.get("/registrations", async (req, res) => {
  res.json(await listRegistrations(req.query));
});

router.delete("/registrations/:id", async (req, res) => {
  const row = await Registration.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ message: "Registration not found" });
  res.json({ ok: true });
});

router.get("/registrations/export", async (req, res) => {
  const items = await listRegistrations(req.query);
  const arts = req.query.scope === "arts" || req.query.itemType === "arts";
  const header = arts
    ? "Kind,Event,Student / Leader,Class,House,Department,Phone,Email,Members,Ticket,Date"
    : "Name,Email,Phone,College,Type,Title,Amount,Ticket,Status,Date";
  const rows = items.map((r) =>
    arts
      ? [
          r.participationType,
          r.itemTitle,
          r.studentName,
          r.studentClass,
          r.houseName,
          r.department,
          r.phone,
          r.email,
          (r.members || []).map((m) => `${m.name} (${m.studentClass}, ${m.department})`).join("; "),
          r.ticketCode,
          r.createdAt?.toISOString?.() || r.createdAt,
        ]
          .map(csvCell)
          .join(",")
      : [
          r.user?.name || r.studentName,
          r.user?.email || r.email,
          r.user?.phone || r.phone,
          r.user?.college,
          r.itemType,
          r.itemTitle,
          r.amount,
          r.ticketCode,
          r.status,
          r.createdAt?.toISOString?.() || r.createdAt,
        ]
          .map(csvCell)
          .join(",")
  );
  const filename = arts ? "pragati-event-registrations.csv" : "pragati-paid-registrations.csv";
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.send([header, ...rows].join("\n"));
});

router.get("/media", async (req, res) => {
  try {
    if (isCloudinaryReady()) {
      const items = await listImages({ folder: req.query.folder || "pragati" });
      return res.json(items);
    }
    res.json(listLocalImages());
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not list images" });
  }
});

router.post("/media", uploadMedia.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    if (isCloudinaryReady()) {
      const uploaded = await uploadBuffer(req.file.buffer, req.file.originalname, req.query.folder || "pragati");
      return res.json({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        source: "cloudinary",
      });
    }
    const local = saveLocalImage(req.file.buffer, req.file.originalname);
    res.json({ ...local, source: "local" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Image upload failed" });
  }
});

router.get("/certificates", async (_req, res) => {
  const items = await Certificate.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(items.map((c) => ({ ...c.toObject(), downloadUrl: publicFileUrl(c.storedPath) })));
});

router.post("/certificates", uploadCertificates.array("files", 40), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: "Upload one or more PDF files" });

    const users = await User.find({ role: "student" }).select("name email");
    const created = [];

    for (const file of req.files) {
      const studentName = path.parse(file.originalname).name.replace(/[_-]+/g, " ").trim();
      const match = users.find((u) => normalizeName(u.name) === normalizeName(studentName));
      const cert = await Certificate.create({
        originalName: file.originalname,
        storedPath: file.path,
        studentName,
        user: match?._id,
        matched: Boolean(match),
      });
      created.push(cert);
    }

    res.status(201).json({
      message: `${created.length} certificate(s) uploaded`,
      matched: created.filter((c) => c.matched).length,
      unmatched: created.filter((c) => !c.matched).length,
      items: created,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/certificates/:id/match", async (req, res) => {
  const { userId, studentName } = req.body;
  const cert = await Certificate.findById(req.params.id);
  if (!cert) return res.status(404).json({ message: "Certificate not found" });
  if (userId) {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    cert.user = user._id;
    cert.studentName = user.name;
    cert.matched = true;
  } else if (studentName) {
    cert.studentName = studentName;
    const user = await User.findOne({ name: new RegExp(`^${studentName}$`, "i") });
    cert.user = user?._id;
    cert.matched = Boolean(user);
  }
  await cert.save();
  res.json(cert);
});

router.delete("/certificates/:id", async (req, res) => {
  await Certificate.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;

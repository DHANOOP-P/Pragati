import { Router } from "express";
import path from "path";
import ArtsEvent from "../models/ArtsEvent.js";
import Registration from "../models/Registration.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { isCollegeEmail } from "../utils/collegeEmail.js";
import { completeRegistration, serializeRegistration } from "../utils/completeRegistration.js";
import { ARTS_KIND_LIMIT, artsQuotaForUser } from "../utils/artsQuota.js";
import { cleanMember } from "../utils/studentMeta.js";
import House from "../models/House.js";
import { parseRegistrationDetails, validateRegistrationDetails } from "../utils/registrationDetails.js";
import { assertServiceAvailable, sendUnavailable } from "../utils/serviceGates.js";

const router = Router();

router.get("/me/arts-quota", protect, async (req, res) => {
  res.json(await artsQuotaForUser(req.user._id));
});

router.post("/arts/:id", protect, async (req, res) => {
  try {
    if (!isCollegeEmail(req.user.email)) {
      return res.status(403).json({
        message:
          "Arts events are only for GEC Wayanad students. Use an email like name_21b410cs@gecwyd.ac.in",
      });
    }

    const event = await ArtsEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    try {
      await assertServiceAvailable("arts");
    } catch (err) {
      if (sendUnavailable(res, err)) return;
      throw err;
    }
    if (!event.isOpen) return res.status(400).json({ message: "Registration is closed" });
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ message: "This event is full" });
    }

    const already = await Registration.findOne({
      user: req.user._id,
      itemType: "arts",
      itemId: event._id,
      status: "confirmed",
    });
    if (already) return res.status(409).json({ message: "Already registered", registration: serializeRegistration(already) });

    const kind = event.participationType === "group" ? "group" : "individual";
    const quota = await artsQuotaForUser(req.user._id);
    if (quota[kind].remaining <= 0) {
      return res.status(400).json({
        message: `You can register for only ${ARTS_KIND_LIMIT} ${kind} arts events.`,
        quota,
      });
    }

    const details = parseRegistrationDetails(req.body, req.user);
    const invalid = validateRegistrationDetails(details, { requireHouse: true });
    if (invalid) return res.status(400).json({ message: invalid });

    const { studentClass, houseName, department, phone, college, semester, studentName, email } = details;
    const houseOk = await House.findOne({
      name: new RegExp(`^${houseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });
    if (!houseOk) {
      return res.status(400).json({ message: "Choose a valid house." });
    }

    let members = [];
    if (kind === "group") {
      members = (Array.isArray(req.body?.members) ? req.body.members : []).map(cleanMember);
      if (!members.length) {
        return res.status(400).json({ message: "Add at least one group member besides the leader." });
      }
      if (members.some((m) => !m.name || !m.studentClass || !m.department)) {
        return res.status(400).json({ message: "Each group member needs name, class and department." });
      }
    }

    await User.findByIdAndUpdate(req.user._id, {
      studentClass,
      houseName,
      department,
      phone,
      college,
      semester,
    });

    const registration = await completeRegistration({
      user: req.user,
      itemType: "arts",
      item: event,
      amount: 0,
      extras: {
        participationType: kind,
        studentName,
        studentClass,
        semester,
        houseName,
        department,
        phone,
        email,
        college,
        members,
      },
    });

    event.registeredCount += 1;
    await event.save();

    res.status(201).json({
      message: "Registered. Ticket sent to your email.",
      registration: serializeRegistration(registration),
      quota: await artsQuotaForUser(req.user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  const items = await Registration.find({ user: req.user._id, status: "confirmed" }).sort({
    createdAt: -1,
  });
  res.json(items.map(serializeRegistration));
});

router.get("/:id/ticket", protect, async (req, res) => {
  const reg = await Registration.findById(req.params.id);
  if (!reg) return res.status(404).json({ message: "Ticket not found" });
  if (String(reg.user) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }
  if (!reg.ticketPath) return res.status(404).json({ message: "Ticket file missing" });
  res.download(path.resolve(reg.ticketPath));
});

router.get("/:id/invoice", protect, async (req, res) => {
  const reg = await Registration.findById(req.params.id);
  if (!reg) return res.status(404).json({ message: "Invoice not found" });
  if (String(reg.user) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }
  if (!reg.invoicePath) return res.status(404).json({ message: "No invoice for this registration" });
  res.download(path.resolve(reg.invoicePath));
});

export default router;

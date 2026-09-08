import { Router } from "express";
import ArtsEvent from "../models/ArtsEvent.js";
import Workshop from "../models/Workshop.js";
import Proshow from "../models/Proshow.js";
import Ad from "../models/Ad.js";
import Winner from "../models/Winner.js";
import PreEvent from "../models/PreEvent.js";
import House from "../models/House.js";
import { protect } from "../middleware/auth.js";
import { isCollegeEmail } from "../utils/collegeEmail.js";
import { serializeGates, getServiceGates } from "../utils/serviceGates.js";

const router = Router();

router.get("/events", async (_req, res) => {
  const items = await ArtsEvent.find().sort({ date: 1 });
  res.json(items);
});

router.get("/events/:id", async (req, res) => {
  const item = await ArtsEvent.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Event not found" });
  res.json(item);
});

router.get("/workshops", async (_req, res) => {
  const items = await Workshop.find().sort({ date: 1 });
  res.json(items);
});

router.get("/workshops/:id", async (req, res) => {
  const item = await Workshop.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Workshop not found" });
  res.json(item);
});

router.get("/proshows", async (_req, res) => {
  const items = await Proshow.find().sort({ date: 1 });
  res.json(items);
});

router.get("/proshows/:id", async (req, res) => {
  const item = await Proshow.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Proshow not found" });
  res.json(item);
});

router.get("/ads", async (req, res) => {
  const placement = req.query.placement;
  const filter = { active: true };
  if (placement) filter.placement = { $in: [placement, "both"] };
  const items = await Ad.find(filter).sort({ createdAt: -1 });
  res.json(items);
});

router.get("/points", protect, async (req, res) => {
  if (req.user.role !== "admin" && !isCollegeEmail(req.user.email)) {
    return res.status(403).json({
      message: "Point table is only for GEC Wayanad students. Sign in with your college mail.",
    });
  }
  const houses = await House.find().sort({ points: -1, order: 1, name: 1 });
  res.json(houses.map((house, i) => ({ ...house.toObject(), rank: i + 1 })));
});

router.get("/winners", async (_req, res) => {
  const items = await Winner.find({ published: true }).sort({ createdAt: -1 });
  res.json(items);
});

router.get("/preevents", async (_req, res) => {
  const items = await PreEvent.find({ isOpen: { $ne: false } }).sort({ date: 1 });
  res.json(items);
});

router.get("/preevents/:id", async (req, res) => {
  const item = await PreEvent.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Pre-event not found" });
  res.json(item);
});

router.get("/service-gates", async (_req, res) => {
  res.json(serializeGates(await getServiceGates()));
});

export default router;

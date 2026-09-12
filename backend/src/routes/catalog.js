import { Router } from "express";
import ArtsEvent from "../models/ArtsEvent.js";
import Workshop from "../models/Workshop.js";
import Proshow from "../models/Proshow.js";
import Ad from "../models/Ad.js";
import Winner from "../models/Winner.js";
import PreEvent from "../models/PreEvent.js";
import House from "../models/House.js";
import { protect } from "../middleware/auth.js";
import { HOUSE_TABLE } from "../utils/studentMeta.js";
import { isCollegeEmail } from "../utils/collegeEmail.js";
import { serializeGates, getServiceGates } from "../utils/serviceGates.js";
import { catalogCacheGet, catalogCacheSet } from "../utils/catalogCache.js";

const router = Router();
const OPEN = { isOpen: { $ne: false } };
const WORKSHOP_FIELDS = "title description date venue image mentor price capacity registeredCount isOpen";
const PROSHOW_FIELDS = "title description date venue image artist price capacity registeredCount isOpen";
const PREEVENT_FIELDS = "title description date venue image category isOpen";

async function cachedList(key, query) {
  const hit = catalogCacheGet(key);
  if (hit) return hit;
  const items = await query();
  catalogCacheSet(key, items);
  return items;
}

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
  const items = await cachedList("workshops", () =>
    Workshop.find(OPEN).select(WORKSHOP_FIELDS).sort({ date: 1 }).lean()
  );
  res.json(items);
});

router.get("/workshops/:id", async (req, res) => {
  const item = await Workshop.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Workshop not found" });
  res.json(item);
});

router.get("/proshows", async (_req, res) => {
  const items = await cachedList("proshows", () =>
    Proshow.find(OPEN).select(PROSHOW_FIELDS).sort({ date: 1 }).lean()
  );
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
  for (const row of HOUSE_TABLE) {
    await House.findOneAndUpdate({ name: row.name }, { $setOnInsert: row }, { upsert: true });
  }
  const houses = await House.find().sort({ points: -1, order: 1, name: 1 });
  res.json(houses.map((house, i) => ({ ...house.toObject(), rank: i + 1 })));
});

router.get("/winners", async (_req, res) => {
  const items = await Winner.find({ published: true }).sort({ createdAt: -1 });
  res.json(items);
});

router.get("/preevents", async (_req, res) => {
  const items = await cachedList("preevents", () =>
    PreEvent.find(OPEN).select(PREEVENT_FIELDS).sort({ date: 1 }).lean()
  );
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

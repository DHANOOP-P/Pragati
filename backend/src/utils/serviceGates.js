import ServiceGate from "../models/ServiceGate.js";

const FIELD = {
  arts: "artsOpen",
  workshop: "workshopsOpen",
  proshow: "proshowsOpen",
};

export function serializeGates(doc) {
  return {
    artsOpen: doc?.artsOpen !== false,
    workshopsOpen: doc?.workshopsOpen !== false,
    proshowsOpen: doc?.proshowsOpen !== false,
  };
}

export async function getServiceGates() {
  let doc = await ServiceGate.findOne({ key: "main" });
  if (!doc) {
    doc = await ServiceGate.create({
      key: "main",
      artsOpen: true,
      workshopsOpen: true,
      proshowsOpen: true,
    });
  }
  return doc;
}

export async function assertServiceAvailable(itemType) {
  const field = FIELD[itemType];
  if (!field) return serializeGates(await getServiceGates());
  const gates = serializeGates(await getServiceGates());
  if (!gates[field]) {
    const err = new Error("This service is unavailable.");
    err.status = 503;
    err.code = "SERVICE_UNAVAILABLE";
    throw err;
  }
  return gates;
}

export function sendUnavailable(res, err) {
  if (err?.code !== "SERVICE_UNAVAILABLE") return false;
  res.status(err.status || 503).json({ message: err.message, code: err.code });
  return true;
}

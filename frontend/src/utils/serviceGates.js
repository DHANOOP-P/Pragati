import api from "../api/client";

const FIELD = {
  arts: "artsOpen",
  workshop: "workshopsOpen",
  proshow: "proshowsOpen",
};

export async function isServiceOpen(itemType) {
  const { data } = await api.get("/service-gates");
  const field = FIELD[itemType];
  if (!field) return true;
  return data?.[field] !== false;
}

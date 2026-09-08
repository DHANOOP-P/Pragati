import ArtsEvent from "../models/ArtsEvent.js";
import Registration from "../models/Registration.js";

export const ARTS_KIND_LIMIT = 3;

export async function artsQuotaForUser(userId) {
  const regs = await Registration.find({
    user: userId,
    itemType: "arts",
    status: "confirmed",
  });
  const registeredIds = regs.map((r) => String(r.itemId));
  if (!registeredIds.length) {
    return {
      group: { used: 0, limit: ARTS_KIND_LIMIT, remaining: ARTS_KIND_LIMIT },
      individual: { used: 0, limit: ARTS_KIND_LIMIT, remaining: ARTS_KIND_LIMIT },
      registeredIds: [],
    };
  }

  const events = await ArtsEvent.find({ _id: { $in: regs.map((r) => r.itemId) } });
  const used = { group: 0, individual: 0 };
  for (const event of events) {
    if (event.participationType === "group") used.group += 1;
    if (event.participationType === "individual") used.individual += 1;
  }

  return {
    group: {
      used: used.group,
      limit: ARTS_KIND_LIMIT,
      remaining: Math.max(0, ARTS_KIND_LIMIT - used.group),
    },
    individual: {
      used: used.individual,
      limit: ARTS_KIND_LIMIT,
      remaining: Math.max(0, ARTS_KIND_LIMIT - used.individual),
    },
    registeredIds,
  };
}

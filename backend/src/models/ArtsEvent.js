import mongoose from "mongoose";

const artsEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    venue: { type: String, default: "GEC Wayanad" },
    image: { type: String, default: "" },
    category: { type: String, default: "Stage" },
    stage: { type: String, enum: ["onstage", "offstage"], default: "onstage" },
    participationType: { type: String, enum: ["group", "individual"], default: "individual" },
    capacity: { type: Number, default: 80 },
    registeredCount: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("ArtsEvent", artsEventSchema);

import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    media: { type: String, default: "" },
    link: { type: String, default: "" },
    placement: { type: String, enum: ["workshop", "proshow", "both"], default: "both" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Ad", adSchema);

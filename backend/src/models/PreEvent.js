import mongoose from "mongoose";

const preEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    venue: { type: String, default: "GEC Wayanad" },
    image: { type: String, default: "" },
    category: { type: String, default: "Campus" },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

preEventSchema.index({ isOpen: 1, date: 1 });

export default mongoose.model("PreEvent", preEventSchema);

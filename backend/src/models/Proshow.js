import mongoose from "mongoose";

const proshowSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    venue: { type: String, default: "Open Stage, GEC Wayanad" },
    image: { type: String, default: "" },
    artist: { type: String, default: "" },
    capacity: { type: Number, default: 800 },
    registeredCount: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    price: { type: Number, required: true, default: 499 },
  },
  { timestamps: true }
);

export default mongoose.model("Proshow", proshowSchema);

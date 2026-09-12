import mongoose from "mongoose";

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    venue: { type: String, default: "GEC Wayanad" },
    image: { type: String, default: "" },
    mentor: { type: String, default: "" },
    capacity: { type: Number, default: 40 },
    registeredCount: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    price: { type: Number, required: true, default: 299 },
  },
  { timestamps: true }
);

workshopSchema.index({ isOpen: 1, date: 1 });

export default mongoose.model("Workshop", workshopSchema);

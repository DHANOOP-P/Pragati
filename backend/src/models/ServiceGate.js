import mongoose from "mongoose";

const serviceGateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "main" },
    artsOpen: { type: Boolean, default: true },
    workshopsOpen: { type: Boolean, default: true },
    proshowsOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceGate", serviceGateSchema);

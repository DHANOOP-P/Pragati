import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storedPath: { type: String, required: true },
    studentName: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    matched: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", certificateSchema);

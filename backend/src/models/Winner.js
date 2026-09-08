import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    eventTitle: { type: String, required: true },
    studentName: { type: String, required: true },
    position: { type: String, required: true },
    department: { type: String, default: "" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Winner", winnerSchema);

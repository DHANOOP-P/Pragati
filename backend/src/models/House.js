import mongoose from "mongoose";

const houseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    points: { type: Number, default: 0, min: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("House", houseSchema);

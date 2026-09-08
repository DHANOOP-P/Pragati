import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    college: { type: String, default: "" },
    studentClass: { type: String, default: "" },
    houseName: { type: String, default: "" },
    department: { type: String, default: "" },
    role: { type: String, enum: ["student", "admin"], default: "student" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

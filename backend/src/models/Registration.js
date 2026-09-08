import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemType: { type: String, enum: ["arts", "workshop", "proshow"], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemTitle: { type: String, required: true },
    status: { type: String, enum: ["pending", "confirmed"], default: "pending" },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    amount: { type: Number, default: 0 },
    ticketCode: { type: String, required: true, unique: true },
    ticketPath: { type: String, default: "" },
    invoicePath: { type: String, default: "" },
    participationType: { type: String, enum: ["group", "individual", ""], default: "" },
    studentName: { type: String, default: "" },
    studentClass: { type: String, default: "" },
    houseName: { type: String, default: "" },
    department: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    members: [
      {
        name: { type: String, default: "" },
        studentClass: { type: String, default: "" },
        department: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

registrationSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

export default mongoose.model("Registration", registrationSchema);

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemType: { type: String, enum: ["workshop", "proshow"], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    invoicePath: { type: String, default: "" },
    mock: { type: Boolean, default: false },
    details: {
      studentName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      college: { type: String, default: "" },
      studentClass: { type: String, default: "" },
      semester: { type: String, default: "" },
      department: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

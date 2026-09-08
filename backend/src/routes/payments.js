import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Workshop from "../models/Workshop.js";
import Proshow from "../models/Proshow.js";
import Payment from "../models/Payment.js";
import Registration from "../models/Registration.js";
import { protect } from "../middleware/auth.js";
import { completeRegistration, serializeRegistration } from "../utils/completeRegistration.js";
import { assertServiceAvailable, sendUnavailable } from "../utils/serviceGates.js";

const router = Router();

function razorpayReady() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

async function loadPaidItem(itemType, itemId) {
  if (itemType === "workshop") return Workshop.findById(itemId);
  if (itemType === "proshow") return Proshow.findById(itemId);
  return null;
}

router.post("/order", protect, async (req, res) => {
  try {
    const { itemType, itemId } = req.body;
    if (!["workshop", "proshow"].includes(itemType)) {
      return res.status(400).json({ message: "Only workshops and proshows are paid" });
    }

    const item = await loadPaidItem(itemType, itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    try {
      await assertServiceAvailable(itemType);
    } catch (err) {
      if (sendUnavailable(res, err)) return;
      throw err;
    }
    if (!item.isOpen) return res.status(400).json({ message: "Registration is closed" });
    if (item.registeredCount >= item.capacity) {
      return res.status(400).json({ message: "Sold out" });
    }

    const already = await Registration.findOne({
      user: req.user._id,
      itemType,
      itemId: item._id,
      status: "confirmed",
    });
    if (already) return res.status(409).json({ message: "Already registered" });

    const amountPaise = Math.round(Number(item.price) * 100);
    const payment = await Payment.create({
      user: req.user._id,
      itemType,
      itemId: item._id,
      amount: item.price,
      status: "created",
      mock: !razorpayReady(),
    });

    if (!razorpayReady()) {
      return res.json({
        mock: true,
        key: "mock",
        orderId: `mock_order_${payment._id}`,
        amount: amountPaise,
        currency: "INR",
        paymentId: payment._id,
        itemTitle: item.title,
      });
    }

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: String(payment._id),
      notes: { itemType, itemId: String(item._id), userId: String(req.user._id) },
    });

    payment.razorpayOrderId = order.id;
    await payment.save();

    res.json({
      mock: false,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      paymentId: payment._id,
      itemTitle: item.title,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/verify", protect, async (req, res) => {
  try {
    const {
      paymentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      mockConfirm,
    } = req.body;

    const payment = await Payment.findOne({ _id: paymentId, user: req.user._id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const item = await loadPaidItem(payment.itemType, payment.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    try {
      await assertServiceAvailable(payment.itemType);
    } catch (err) {
      if (sendUnavailable(res, err)) return;
      throw err;
    }

    const already = await Registration.findOne({
      user: req.user._id,
      itemType: payment.itemType,
      itemId: item._id,
      status: "confirmed",
    });
    if (already) {
      return res.json({
        message: "Already registered",
        registration: serializeRegistration(already),
      });
    }

    if (payment.mock || mockConfirm) {
      payment.status = "paid";
      payment.razorpayPaymentId = razorpay_payment_id || `mock_pay_${Date.now()}`;
      await payment.save();
    } else {
      if (!razorpayReady()) {
        return res.status(400).json({ message: "Razorpay is not configured" });
      }
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
      if (expected !== razorpay_signature) {
        payment.status = "failed";
        await payment.save();
        return res.status(400).json({ message: "Payment signature mismatch" });
      }
      payment.status = "paid";
      payment.razorpayOrderId = razorpay_order_id;
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      await payment.save();
    }

    const registration = await completeRegistration({
      user: req.user,
      itemType: payment.itemType,
      item,
      amount: payment.amount,
      payment,
    });

    item.registeredCount += 1;
    await item.save();

    payment.invoicePath = registration.invoicePath;
    await payment.save();

    res.json({
      message: "Payment successful. Invoice and ticket sent to your email.",
      registration: serializeRegistration(registration),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/config", (_req, res) => {
  res.json({
    mock: !razorpayReady(),
    key: process.env.RAZORPAY_KEY_ID || "",
  });
});

export default router;

import api from "../api/client";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function startPaidCheckout({ itemType, itemId, user, onSuccess }) {
  const { data: order } = await api.post("/payments/order", { itemType, itemId });

  if (order.mock) {
    const ok = window.confirm(`Confirm test payment for ${order.itemTitle} — ₹${order.amount / 100}?`);
    if (!ok) return;
    const { data } = await api.post("/payments/verify", {
      paymentId: order.paymentId,
      mockConfirm: true,
    });
    onSuccess(data);
    return;
  }

  const ready = await loadRazorpay();
  if (!ready) throw new Error("Could not load Razorpay");

  const rzp = new window.Razorpay({
    key: order.key,
    amount: order.amount,
    currency: order.currency,
    name: "Pragati",
    description: order.itemTitle,
    order_id: order.orderId,
    prefill: { name: user?.name, email: user?.email },
    theme: { color: "#d7b56d" },
    async handler(response) {
      const { data } = await api.post("/payments/verify", {
        paymentId: order.paymentId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
      onSuccess(data);
    },
  });
  rzp.open();
}

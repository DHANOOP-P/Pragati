import Registration from "../models/Registration.js";
import { generateInvoicePdf, generateTicketPdf, publicFileUrl } from "./pdf.js";
import { sendMail, ticketEmailHtml } from "./email.js";
import { makeTicketCode } from "./ticket.js";

const prefixes = { arts: "ART", workshop: "WKS", proshow: "PRO" };

export async function completeRegistration({
  user,
  itemType,
  item,
  amount = 0,
  payment = null,
  extras = {},
}) {
  const existing = await Registration.findOne({
    user: user._id,
    itemType,
    itemId: item._id,
  });
  if (existing?.status === "confirmed") {
    return existing;
  }

  const ticketCode = existing?.ticketCode || makeTicketCode(prefixes[itemType] || "PRG");
  const ticketPath = await generateTicketPdf({
    ticketCode,
    name: user.name,
    email: user.email,
    title: item.title,
    itemType,
    date: item.date,
    venue: item.venue,
  });

  let invoicePath = "";
  if (amount > 0) {
    invoicePath = await generateInvoicePdf({
      invoiceNo: `INV-${ticketCode}`,
      name: user.name,
      email: user.email,
      title: item.title,
      amount,
      paymentId: payment?.razorpayPaymentId || payment?._id,
    });
  }

  const payload = {
    user: user._id,
    itemType,
    itemId: item._id,
    itemTitle: item.title,
    status: "confirmed",
    payment: payment?._id,
    amount,
    ticketCode,
    ticketPath,
    invoicePath,
    ...extras,
  };

  const registration = existing
    ? await Registration.findByIdAndUpdate(existing._id, payload, { new: true })
    : await Registration.create(payload);

  const attachments = [
    { filename: `ticket-${ticketCode}.pdf`, path: ticketPath },
  ];
  if (invoicePath) {
    attachments.push({ filename: `invoice-${ticketCode}.pdf`, path: invoicePath });
  }

  await sendMail({
    to: user.email,
    subject: `Pragati ticket — ${item.title}`,
    html: ticketEmailHtml({
      name: user.name,
      title: item.title,
      ticketCode,
      paid: amount > 0,
    }),
    attachments,
  });

  return registration;
}

export function serializeRegistration(reg) {
  return {
    ...reg.toObject(),
    ticketUrl: publicFileUrl(reg.ticketPath),
    invoiceUrl: publicFileUrl(reg.invoicePath),
  };
}

import { Router } from "express";
import { hasSmtp, sendMail } from "../utils/email.js";

const router = Router();
const CONTACT_TO = process.env.CONTACT_TO || "pragati2024lead@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hits = new Map();

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clientKey(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}

function tooMany(key) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (hits.get(key) || []).filter((time) => now - time < windowMs);
  if (recent.length >= 5) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

router.post("/", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const message = String(req.body?.message || "").trim();
  const honey = String(req.body?.company || "").trim();

  if (honey) return res.json({ ok: true });
  if (tooMany(clientKey(req))) {
    return res.status(429).json({ message: "Please wait a bit before sending another note." });
  }
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are required." });
  }
  if (name.length > 80 || email.length > 120 || message.length > 2000) {
    return res.status(400).json({ message: "That note is a little too long." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Enter a valid email so the desk can reply." });
  }
  if (!hasSmtp()) {
    return res.status(503).json({ message: "Mail is not configured on the desk yet. Try again later." });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  try {
    const sent = await sendMail({
      to: CONTACT_TO,
      replyTo: email,
      subject: `Pragati contact — ${name}`,
      text: `${name} <${email}>\n\n${message}`,
      html: `
        <div style="font-family:Georgia,serif;background:#0b0b0b;color:#f7f1e3;padding:32px">
          <h1 style="letter-spacing:6px;color:#d4af37">PRAGATI</h1>
          <p style="color:#e8c4c4">Contact desk</p>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p>${safeMessage}</p>
        </div>
      `,
    });
    if (sent.mocked) {
      return res.status(503).json({ message: "Mail is not configured on the desk yet. Try again later." });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(502).json({ message: "Could not send that note. Try again later." });
  }
});

export default router;

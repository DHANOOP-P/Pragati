import nodemailer from "nodemailer";

function hasSmtp() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendMail({ to, subject, html, attachments = [] }) {
  if (!hasSmtp()) {
    console.log("\n[EMAIL LOG — SMTP not configured]");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Attachments:", attachments.map((a) => a.filename).join(", ") || "none");
    console.log("HTML preview:", html.replace(/<[^>]+>/g, " ").slice(0, 240));
    console.log("");
    return { mocked: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    attachments,
  });

  return { mocked: false };
}

export function ticketEmailHtml({ name, title, ticketCode, paid }) {
  return `
    <div style="font-family:Georgia,serif;background:#0b0b0b;color:#f7f1e3;padding:32px">
      <h1 style="letter-spacing:6px;color:#d4af37">PRAGATI</h1>
      <p style="color:#e8c4c4">For the pursuit of righteous justice with art</p>
      <h2>Hello ${name},</h2>
      <p>Your registration for <strong>${title}</strong> is confirmed.</p>
      <p>Ticket code: <strong>${ticketCode}</strong></p>
      <p>${paid ? "Invoice and ticket are attached." : "Your free arts-event ticket is attached."}</p>
    </div>
  `;
}

import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { uploadRootPath } from "../middleware/upload.js";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function drawHeader(doc, subtitle) {
  doc.rect(0, 0, doc.page.width, 90).fill("#111111");
  doc.fillColor("#d4af37").fontSize(26).text("PRAGATI", 48, 28);
  doc.fillColor("#f7f1e3").fontSize(10).text(subtitle, 48, 58);
}

export async function generateTicketPdf({ ticketCode, name, email, title, itemType, date, venue }) {
  const dir = path.join(uploadRootPath, "tickets");
  ensureDir(dir);
  const filename = `${ticketCode}.pdf`;
  const filePath = path.join(dir, filename);
  const qrDataUrl = await QRCode.toDataURL(`PRAGATI|${ticketCode}|${title}`);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A5", margin: 36 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    drawHeader(doc, "Official Event Ticket");
    doc.fillColor("#111").fontSize(16).text(title, 36, 120);
    doc.fontSize(11).fillColor("#444")
      .text(`Guest: ${name}`)
      .text(`Email: ${email}`)
      .text(`Type: ${itemType}`)
      .text(`Venue: ${venue || "GEC Wayanad"}`)
      .text(`Date: ${date ? new Date(date).toLocaleString("en-IN") : "To be announced"}`)
      .moveDown()
      .fillColor("#d4af37")
      .fontSize(13)
      .text(`Ticket  ${ticketCode}`);
    const qr = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    doc.image(Buffer.from(qr, "base64"), 36, 320, { width: 110 });
    doc.fontSize(8).fillColor("#777").text("For the pursuit of righteous justice with art", 36, 500);
    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return filePath;
}

export async function generateInvoicePdf({ invoiceNo, name, email, title, amount, paymentId }) {
  const dir = path.join(uploadRootPath, "invoices");
  ensureDir(dir);
  const filename = `${invoiceNo}.pdf`;
  const filePath = path.join(dir, filename);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    drawHeader(doc, "Tax Invoice / Payment Receipt");
    doc.fillColor("#111").fontSize(14).text("Billed to", 48, 130);
    doc.fontSize(11).fillColor("#333").text(name).text(email);
    doc.moveDown();
    doc.fontSize(12).text(`Invoice: ${invoiceNo}`);
    doc.text(`Payment ref: ${paymentId || "MOCK-PAY"}`);
    doc.text(`Item: ${title}`);
    doc.text(`Amount paid: INR ${Number(amount).toFixed(2)}`);
    doc.moveDown();
    doc.fillColor("#d4af37").text("Status: PAID");
    doc.moveDown(2);
    doc.fillColor("#666").fontSize(9).text("Pragati Arts Festival · Government Engineering College Wayanad");
    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return filePath;
}

export function publicFileUrl(absPath) {
  if (!absPath) return "";
  const rel = path.relative(uploadRootPath, absPath).replace(/\\/g, "/");
  return `/uploads/${rel}`;
}

function cellText(value, max = 42) {
  const text = String(value ?? "—").replace(/\s+/g, " ").trim() || "—";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function buildTablePdfBuffer({ title, headers, rows }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 36,
      autoFirstPage: true,
      bufferPages: true,
      info: { Title: title || "Pragati export", Author: "Pragati" },
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const cols = Array.isArray(headers) ? headers.map((h) => String(h || "")) : [];
    const data = Array.isArray(rows) ? rows : [];
    const pageLeft = doc.page.margins.left;
    const pageRight = doc.page.width - doc.page.margins.right;
    const pageWidth = pageRight - pageLeft;
    const colCount = Math.max(cols.length, 1);
    const colW = pageWidth / colCount;
    const rowH = 16;
    const bottom = doc.page.height - doc.page.margins.bottom;
    let y = doc.page.margins.top;

    const paintTitle = () => {
      doc.fillColor("#111111").font("Helvetica-Bold").fontSize(14).text("PRAGATI", pageLeft, y, { lineBreak: false });
      doc.fillColor("#555555").font("Helvetica").fontSize(10).text(String(title || "Export"), pageLeft, y + 18, { lineBreak: false });
      doc.fillColor("#888888").fontSize(8).text(`Generated ${new Date().toLocaleString("en-IN")}`, pageLeft, y + 32, {
        lineBreak: false,
      });
      y = doc.page.margins.top + 48;
    };

    const paintHeader = () => {
      doc.save();
      doc.rect(pageLeft, y, pageWidth, rowH + 4).fill("#111111");
      doc.fillColor("#d4af37").font("Helvetica-Bold").fontSize(7);
      cols.forEach((label, i) => {
        doc.text(cellText(label, 28), pageLeft + i * colW + 3, y + 5, {
          width: colW - 6,
          lineBreak: false,
        });
      });
      doc.restore();
      y += rowH + 6;
    };

    const newPage = () => {
      doc.addPage();
      y = doc.page.margins.top;
      paintTitle();
      paintHeader();
    };

    paintTitle();
    paintHeader();

    if (!data.length) {
      doc.fillColor("#666666").font("Helvetica").fontSize(10).text("No rows to export.", pageLeft, y + 6);
    } else {
      data.forEach((row, idx) => {
        if (y + rowH > bottom) newPage();
        if (idx % 2 === 1) {
          doc.save();
          doc.rect(pageLeft, y, pageWidth, rowH).fill("#f4efe6");
          doc.restore();
        }
        doc.fillColor("#222222").font("Helvetica").fontSize(7);
        cols.forEach((_, i) => {
          doc.text(cellText(row?.[i], 36), pageLeft + i * colW + 3, y + 4, {
            width: colW - 6,
            lineBreak: false,
          });
        });
        y += rowH;
      });
    }

    doc.end();
  });
}

/** Build a complete PDF buffer, then send it (avoids corrupt partial downloads). */
export async function sendTablePdf(res, { title, filename, headers, rows }) {
  const safeName = String(filename || "pragati-export.pdf").replace(/[^\w.\-]+/g, "_");
  try {
    const buffer = await buildTablePdfBuffer({ title, headers, rows });
    if (!buffer?.length || buffer.slice(0, 4).toString() !== "%PDF") {
      throw new Error("PDF generation failed");
    }
    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", String(buffer.length));
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
    res.setHeader("Cache-Control", "no-store");
    res.end(buffer);
  } catch (err) {
    console.error("PDF export failed:", err);
    if (res.headersSent) return;
    res.status(500).json({ message: err.message || "Could not create PDF export." });
  }
}

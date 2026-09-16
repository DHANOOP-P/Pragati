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

/** Stream a landscape A4 table PDF to an Express response. */
export function sendTablePdf(res, { title, filename, headers, rows }) {
  const safeName = String(filename || "pragati-export.pdf").replace(/[^\w.\-]+/g, "_");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);

  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 36,
    info: { Title: title || "Pragati export", Author: "Pragati" },
  });
  doc.pipe(res);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const cols = Array.isArray(headers) ? headers : [];
  const colCount = Math.max(cols.length, 1);
  const colW = pageWidth / colCount;
  const startX = doc.page.margins.left;
  let y = doc.page.margins.top;

  const drawTitle = () => {
    doc.fillColor("#111111").fontSize(16).text("PRAGATI", startX, y, { continued: false });
    doc.fillColor("#666666").fontSize(10).text(title || "Export", startX, y + 20);
    doc.fillColor("#999999").fontSize(8).text(`Generated ${new Date().toLocaleString("en-IN")}`, startX, y + 34);
    y += 52;
  };

  const ensureSpace = (need = 28) => {
    const bottom = doc.page.height - doc.page.margins.bottom;
    if (y + need <= bottom) return;
    doc.addPage();
    y = doc.page.margins.top;
    drawTitle();
    drawHeaderRow();
  };

  const drawHeaderRow = () => {
    doc.rect(startX, y, pageWidth, 22).fill("#111111");
    doc.fillColor("#d4af37").fontSize(8);
    cols.forEach((label, i) => {
      doc.text(String(label || ""), startX + i * colW + 4, y + 7, {
        width: colW - 8,
        height: 12,
        ellipsis: true,
        lineBreak: false,
      });
    });
    y += 26;
    doc.x = startX;
    doc.y = y;
  };

  const drawRow = (cells, zebra) => {
    const texts = cols.map((_, i) => String(cells[i] ?? "—"));
    let rowH = 18;
    texts.forEach((text) => {
      const h = doc.heightOfString(text, { width: colW - 8 });
      rowH = Math.max(rowH, Math.min(h + 8, 54));
    });
    ensureSpace(rowH + 2);
    if (zebra) doc.rect(startX, y, pageWidth, rowH).fill("#f6f1e8");
    doc.fillColor("#222222").fontSize(7.5);
    texts.forEach((text, i) => {
      doc.text(text, startX + i * colW + 4, y + 4, {
        width: colW - 8,
        height: rowH - 6,
        ellipsis: true,
        lineBreak: false,
      });
    });
    y += rowH;
    doc.x = startX;
    doc.y = y;
  };

  drawTitle();
  drawHeaderRow();

  const data = Array.isArray(rows) ? rows : [];
  if (!data.length) {
    doc.fillColor("#666666").fontSize(10).text("No rows to export.", startX, y + 8);
  } else {
    data.forEach((row, idx) => drawRow(row, idx % 2 === 1));
  }

  doc.end();
}

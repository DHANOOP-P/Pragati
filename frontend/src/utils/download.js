import { resolveApiUrl } from "../api/baseUrl";

export async function downloadAuth(url, filename) {
  const token = localStorage.getItem("pragati_token");
  const res = await fetch(resolveApiUrl(url), { headers: { Authorization: `Bearer ${token}` } });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Download failed");
  }

  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isPdf =
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46; // %PDF

  if (String(filename || "").toLowerCase().endsWith(".pdf") && !isPdf) {
    const text = new TextDecoder().decode(bytes.slice(0, 300));
    throw new Error(text.includes("message") ? "Export failed on the server." : "Invalid PDF received.");
  }

  const blob = new Blob([buffer], {
    type: isPdf ? "application/pdf" : res.headers.get("Content-Type") || "application/octet-stream",
  });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

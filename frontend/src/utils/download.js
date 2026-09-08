import { resolveApiUrl } from "../api/baseUrl";

export async function downloadAuth(url, filename) {
  const token = localStorage.getItem("pragati_token");
  const res = await fetch(resolveApiUrl(url), { headers: { Authorization: `Bearer ${token}` } });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Download failed");
  }
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

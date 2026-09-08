import { apiBaseUrl } from "../api/baseUrl";

export function mediaUrl(src, width) {
  if (!src) return "";
  let url = String(src);
  if (url.startsWith("/uploads")) {
    url = `${apiBaseUrl().replace(/\/api$/, "")}${url}`;
  }
  const marker = "/image/upload/";
  const at = url.indexOf(marker);
  if (at === -1) return url;
  const rest = url.slice(at + marker.length);
  if (/^(f_auto|q_auto|w_|c_|h_|e_)/.test(rest)) return url;
  const transform = width ? `f_auto,q_auto,c_limit,w_${width}` : "f_auto,q_auto";
  return `${url.slice(0, at + marker.length)}${transform}/${rest}`;
}

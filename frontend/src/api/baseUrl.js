/** Production: VITE_API_URL=https://your-api.onrender.com/api */
export function apiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) return "/api";
  let base = String(raw).replace(/\/+$/, "");
  if (!base.endsWith("/api")) base = `${base}/api`;
  return base;
}

/** Resolve `/api/foo` (or a relative `/foo`) to an absolute or proxied URL. */
export function resolveApiUrl(path) {
  if (!path) return apiBaseUrl();
  if (/^https?:\/\//i.test(path)) return path;
  const pathname = path.startsWith("/") ? path : `/${path}`;
  const base = apiBaseUrl();
  if (pathname.startsWith("/api")) {
    const origin = base.replace(/\/api$/, "");
    return `${origin}${pathname}`;
  }
  return `${base}${pathname}`;
}

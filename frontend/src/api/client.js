import axios from "axios";
import { apiBaseUrl } from "./baseUrl";

const api = axios.create({
  baseURL: apiBaseUrl(),
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pragati_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers.delete === "function") config.headers.delete("Content-Type");
    else delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    const method = String(config?.method || "get").toLowerCase();
    const retries = config?.__retries || 0;
    const path = String(config?.url || "").split("?")[0];
    const catalogGet = /(^|\/)(proshows|preevents)\/?$/.test(path);
    const noResponse = !err.response;
    const timedOut = err.code === "ECONNABORTED" || /timeout/i.test(err.message || "");
    const retriable = config && method === "get" && catalogGet && noResponse && retries < 2;

    if (retriable) {
      config.__retries = retries + 1;
      await new Promise((resolve) => setTimeout(resolve, 1500 * config.__retries));
      return api.request(config);
    }

    const message = err.response?.data?.message || err.message || "Request failed";
    const error = new Error(timedOut ? "The desk is waking up. Try again." : message);
    error.code = err.response?.data?.code;
    return Promise.reject(error);
  }
);

export function wakeApi() {
  return api.get("/health").catch(() => {});
}

wakeApi();

export default api;

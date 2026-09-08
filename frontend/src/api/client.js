import axios from "axios";
import { apiBaseUrl } from "./baseUrl";

const api = axios.create({ baseURL: apiBaseUrl() });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pragati_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "Request failed";
    const error = new Error(message);
    error.code = err.response?.data?.code;
    return Promise.reject(error);
  }
);

export default api;

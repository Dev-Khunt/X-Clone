import axios from "axios";

export const tokenKey = "accessToken";

/** Backend URL — must be absolute (not same origin as the Vercel frontend). */
const DEFAULT_API_URL = "http://localhost:4000";

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();

  // Relative or missing env → axios would call the Vercel host (404 on /auth/captcha)
  if (!configured || configured.startsWith("/")) {
    return DEFAULT_API_URL;
  }

  // Common mistake: VITE_API_URL set to the frontend deployment URL on Vercel
  if (typeof window !== "undefined") {
    try {
      if (new URL(configured).origin === window.location.origin) {
        return DEFAULT_API_URL;
      }
    } catch {
      return DEFAULT_API_URL;
    }
  }

  return configured;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    const message =
      data?.message ?? data?.error ?? error?.message ?? "Request failed";
    return Promise.reject(new Error(message));
  }
);

export default api;

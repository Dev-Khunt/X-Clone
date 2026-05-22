import axios from "axios";

export const tokenKey = "accessToken";

/** Always hit the backend on port 4000 (not the Vercel frontend origin). */
export const API_BASE_URL = "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Ensure relative paths never resolve against the Vercel host
  const path = config.url ?? "";
  if (path && !/^https?:\/\//i.test(path)) {
    config.baseURL = API_BASE_URL;
  }

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

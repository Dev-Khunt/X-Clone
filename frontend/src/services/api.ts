import axios from "axios";

export const tokenKey = "accessToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
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

import axios from "axios";

export const tokenKey = "accessToken";

// Axios instance pointing directly at the backend
const axiosInstance = axios.create({
  baseURL: "http://localhost:4000",
});

// Attach the JWT token to every request when present
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalise error responses so call-sites can do `(err as Error).message`
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    const message = data?.message || data?.error || error?.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

/**
 * Generic API helper – drop-in replacement for the previous fetch-based wrapper.
 * Accepts an axios `AxiosRequestConfig`-compatible options object.
 */
export async function api<T>(
  path: string,
  options: {
    method?: string;
    body?: BodyInit | null;
    headers?: Record<string, string>;
    [key: string]: unknown;
  } = {}
): Promise<T> {
  const { method = "GET", body, headers, ...rest } = options;

  const response = await axiosInstance.request<T>({
    url: path,
    method,
    // axios uses `data` for the request body; pass FormData or string as-is
    data: body,
    headers: headers as Record<string, string>,
    ...rest,
  });

  return response.data;
}

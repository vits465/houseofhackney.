
import axios from "axios";
import { store } from "../app/store";
import {
  updateTokens,
  logout,
} from "../features/auth/authSlice";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Separate client prevents refresh calls from triggering this interceptor.
const refreshClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

let refreshPromise = null;

// Attach the latest access token to requests.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const handleSessionExpired = () => {
  const hadToken = Boolean(store.getState().auth?.token);
  store.dispatch(logout());
  try {
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("hoh_preview_role");
  } catch (e) {
    console.warn("Storage clear error:", e);
  }

  if (typeof window !== "undefined" && window.location && hadToken) {
    const currentPath = window.location.pathname;
    const isProtectedRoute =
      currentPath.startsWith("/admin") ||
      currentPath.startsWith("/account") ||
      currentPath.startsWith("/profile");

    if (isProtectedRoute && currentPath !== "/login") {
      const fromParam = `&from=${encodeURIComponent(currentPath)}`;
      window.location.href = `/login?expired=true${fromParam}`;
    }
  }
};

// Refresh tokens after a 401 response.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";

    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    const refreshToken = store.getState().auth?.refreshToken;

    if (!refreshToken) {
      handleSessionExpired();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post("/auth/refresh", { refreshToken })
          .then((response) => {
            const result = response.data;
            const data = result?.data;

            if (
              !result?.success ||
              !data?.accessToken ||
              !data?.refreshToken
            ) {
              throw new Error(
                "Refresh response is missing authentication tokens."
              );
            }

            store.dispatch(
              updateTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
              })
            );

            return data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      handleSessionExpired();
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;

import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  willTokenExpireSoon,
} from "../services/api/tokenManager";
import { API_BASE_URL } from "../constants";

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

async function refreshToken() {
  const res = await instance.post("/auth/refresh");
  const newToken = res.data.access_token;
  setAccessToken(newToken);
  return newToken;
}

// ✅ Request interceptor
instance.interceptors.request.use(
  async (config) => {
    // Skip refresh logic for login and refresh endpoints
    const isLogin = config.url.includes("/auth/login");
    const isRefresh = config.url.includes("/auth/refresh");
    if (isLogin || isRefresh) return config;

    // 🔍 Preemptively refresh token if expiring soon
    if (willTokenExpireSoon()) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshToken();
          onRefreshed(newToken);
        } catch (err) {
          clearAccessToken();
          window.location.href = "/login";
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      await new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          config.headers["Authorization"] = `Bearer ${newToken}`;
          resolve();
        });
      });
    } else {
      const token = getAccessToken();
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor for rare edge cases (401 after sending)
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isRefreshEndpoint = originalRequest.url.includes("/auth/refresh");
    const isLoginEndpoint = originalRequest.url.includes("/auth/login");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshEndpoint &&
      !isLoginEndpoint
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(instance(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const res = await refreshToken();
        onRefreshed(res);

        originalRequest.headers["Authorization"] = `Bearer ${res}`;
        return instance(originalRequest);
      } catch (err) {
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;

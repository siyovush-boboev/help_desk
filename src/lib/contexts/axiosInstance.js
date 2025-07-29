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

async function refreshToken() {
  try {
    const res = await instance.post("/auth/refresh");
    const newToken = res.data.body.access_token;
    setAccessToken(newToken);
    return newToken;
  } catch (err) {
    clearAccessToken();
    window.location.href = "/login";
    throw err;
  }
}

// ✅ Request Interceptor
instance.interceptors.request.use(
  async (config) => {
    const isLogin = config.url.includes("/auth/login");
    const isRefresh = config.url.includes("/auth/refresh");

    // Don’t touch login or refresh calls
    if (isLogin || isRefresh) return config;

    let token = getAccessToken();

    // 🔄 Refresh if token is expiring
    if (willTokenExpireSoon() || !token) {
      try {
        token = await refreshToken();
      } catch (err) {
        console.error("Failed to refresh token:", err);
        return Promise.reject(err);
      }
    }

    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor (only retry once on 401)
instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    const isAuthErr = err.response?.status === 401;
    const notRetrying = !originalRequest._retry;
    const notLoginOrRefresh =
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh");

    if (isAuthErr && notRetrying && notLoginOrRefresh) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(err);
  }
);

export default instance;

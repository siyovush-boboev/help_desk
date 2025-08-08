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
  headers: {
    "ngrok-skip-browser-warning": "true",
  },  
  withCredentials: true,
});

async function refreshToken() {
  try {
    const res = await instance.post("/auth/refresh_token");
    const newToken = res.data.body.accessToken;
    setAccessToken(newToken);
    console.log("New access token set in axios:", newToken);
    return newToken;
  } catch (err) {    
    clearAccessToken();
    console.log("Failed to refresh token, redirecting to login...");
    window.location.href = "/login";
    throw err;
  }
}

// ✅ Request Interceptor
instance.interceptors.request.use(
  async (config) => {
    const isLogin = config.url.includes("/auth/login");
    const isRefresh = config.url.includes("/auth/refresh_token");

    // Не трогаем запросы логина и обновления токена
    if (isLogin || isRefresh) return config;

    let token = getAccessToken();

    // Обновляем токен, если скоро истечет или отсутствует
    if (willTokenExpireSoon() || !token) {
      try {
        console.log("Token is expiring soon or not present, refreshing...");
        token = await refreshToken();
      } catch (err) {
        console.error("Failed to refresh token:", err);
        return Promise.reject(err);
      }
    }

    if (token){
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["ngrok-skip-browser-warning"] = "true";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor (повторяет запрос при 401 один раз)
instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    const isAuthErr = err.response?.status === 401;
    const notRetrying = !originalRequest._retry;
    const notLoginOrRefresh =
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh_token");

    if (isAuthErr && notRetrying && notLoginOrRefresh) {
      originalRequest._retry = true;
      try {
        console.log("Getting new token and retrying request with new token...");
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
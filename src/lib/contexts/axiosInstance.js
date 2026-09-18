import axios from "axios";
import {
  getAccessToken,
  clearAccessToken,
  clearUserLocalStorage,
  willTokenExpireSoon,
} from "../services/api/tokenManager";
import { API_BASE_URL } from "../constants";

// Requests that happen while the user has no valid session yet (or is getting one) —
// excluded from token attachment and from the global 401 -> redirect-to-login handling.
const PUBLIC_AUTH_PATHS = [
  "login",
  "refresh_token",
  "password-reset",
  "password-change",
  "password/request",
  "password/verify_phone",
  "password/reset",
];

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true,
});

// async function refreshToken() {
//   try {
//     const res = await instance.post("/auth/refresh_token");
//     const newToken = res.data.body.accessToken;
//     setAccessToken(newToken);
//     console.log("New access token set in axios:", newToken);
//     return newToken;
//   } catch (err) {    
//     clearAccessToken();
//     console.log("Failed to refresh token, redirecting to login...");
//     window.location.href = "/login";
//     throw err;
//   }
// }

// ✅ Request Interceptor
instance.interceptors.request.use(
  async (config) => {
    // Не трогаем запросы логина и обновления токена
    if (PUBLIC_AUTH_PATHS.some((path) => config.url?.includes(path))) {
      return config;
    }

    let token = getAccessToken();
    // Обновляем токен, если скоро истечет или отсутствует
    if (willTokenExpireSoon() || !token) {
      console.log("Access token is missing or expiring soon");
      // try {
      //   console.log("Token is expiring soon or not present, refreshing...");
      //   token = await refreshToken();
      // } catch (err) {
      //   console.error("Failed to refresh token:", err);
      //   return Promise.reject(err);
      // }
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["ngrok-skip-browser-warning"] = "true";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor — on 401, drop the local session and send the user back to login.
// (403 is left alone here: it means "authenticated but not allowed", which callers
// should handle inline instead of forcing a global logout.)
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthErr = error.response?.status === 401;
    const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => error.config?.url?.includes(path));

    if (isAuthErr && !isPublicAuthRequest) {
      clearAccessToken();
      clearUserLocalStorage();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
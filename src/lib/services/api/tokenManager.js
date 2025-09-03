import { jwtDecode } from "jwt-decode";

let token = null;
let tokenExpiry = null;

export function getAccessToken() {
  return token;
}

export function setAccessToken(newToken) {
  token = newToken;
  try {
    const decoded = jwtDecode(newToken);
    tokenExpiry = decoded.exp * 1000; // JWT exp is in seconds
  } catch (e) {
    tokenExpiry = null;
    console.error("Failed to decode token:", e);
  }
}

export function clearAccessToken() {
  token = null;
  tokenExpiry = null;
}

// Checks if token expiring within the next X seconds
export function willTokenExpireSoon(thresholdMs = 5 * 1000) {
  if (!tokenExpiry) return false;
  return Date.now() + thresholdMs >= tokenExpiry;
}

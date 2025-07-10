import { API_BASE_URL } from "../../constants";
import { getNewAccessToken } from "./authApi";

export const createHttpClient = (auth) => {
  const request = async (url, options = {}, retry = true) => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${auth.accessToken}`,
    };

    const res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: "include", // for cookies
    });

    if (res.status === 401 && retry) {
      try {
        const newToken = await getNewAccessToken();
        auth.setAccessToken(newToken);
        return request(url, options, false);
      } catch (err) {
        throw new Error("Unauthorized, re-login required", err);
      }
    }

    return res;
  };

  return { request };
};


export const fetcher = async ({ url, method = "GET", body = null }) => {
  const headers = {
    "Content-Type": "application/json",
  };

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    // credentials: "include", // remove this if you don’t use cookies
  });

  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status}: ${res.statusText}`);
  }

  return res.json();
};
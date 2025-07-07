import { API_BASE_URL } from "../../constants";

export const login = async (login, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ login, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return await res.json(); // contains access_token and role
};

export const getNewAccessToken = async () => {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include", // send refresh token cookie
  });

  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();
  return data.access_token;
};

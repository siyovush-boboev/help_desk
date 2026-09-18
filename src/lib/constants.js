// Relative to the current origin so the frontend always talks to whatever host served it
// (the IIS reverse proxy in production, or the Vite dev proxy locally) — never a hardcoded backend port.
export const BASE_URL = "";
export const API_BASE_URL = `${BASE_URL}/api`;

export const CACHE_TIME_SECONDS = 900 * 1000;

export const priority_colors = {
    "Низкий": "#22c55e",
    "Средний": "#eab308",
    "Высокий": "#f97316",
    "Критический": "#dc2626",
};

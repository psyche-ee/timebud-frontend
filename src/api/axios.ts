import axios from "axios";

// The deployed frontend talks to the deployed Render API. Local development
// keeps using the backend on port 8000 (including the machine's LAN IP, so a
// phone on the same Wi-Fi works without any configuration).
const DEPLOYED_API_BASE_URL = "https://timebud-backend-qs8l.onrender.com/api";

const resolveBaseURL = () => {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");

  // Vercel/production builds use the live backend.
  if (import.meta.env.PROD) return DEPLOYED_API_BASE_URL;

  // Dev server opened from another device: reach this machine, not the device.
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      const protocol = window.location.protocol === "https:" ? "https:" : "http:";
      return `${protocol}//${hostname}:8000/api`;
    }
  }

  return "http://127.0.0.1:8000/api";
};

const baseURL = resolveBaseURL();

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

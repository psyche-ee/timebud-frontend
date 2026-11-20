import axios from "axios";

// Point at the local Django backend by default. Override for other environments
// with VITE_API_BASE_URL (e.g. the deployed Render URL) in a Vite .env file.
// When opened from another device (e.g. a phone on the same Wi-Fi), use the
// same hostname so requests reach this machine instead of the phone.
const resolveBaseURL = () => {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return configured;

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
import api from "../api/axios";

export interface SessionUser {
  id?: number;
  user_id?: number;
  f_name?: string;
  l_name?: string;
  m_name?: string;
  email?: string;
  dob?: string;
  gender?: string;
  rate_per_hr?: number | string;
  overtime_threshold_hrs?: number | string;
  overtime_rate_per_hr?: number | string;
}

const SESSION_KEYS = [
  "token",
  "user",
  "dashboardCache",
  "earningsCache",
  "recordsCache",
  "offlineQueue",
];

export const readUser = (): SessionUser => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") as SessionUser;
  } catch {
    return {};
  }
};

export const writeUser = (user: SessionUser) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearSession = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const logout = async () => {
  try {
    await api.post("/logout");
  } finally {
    clearSession();
    window.location.assign("/login");
  }
};

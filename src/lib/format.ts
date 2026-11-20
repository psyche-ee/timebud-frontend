import { format } from "date-fns";

export const currency = (value: number | string | null | undefined) =>
  `₱${(Number(value) || 0).toFixed(2)}`;

// Hours are real durations: 9.75 means 9 hours 45 minutes, not 9.75 of 100.
// Convert to whole minutes first so floating point rounding cannot leak into
// the displayed minutes (e.g. 8.1 becomes 8:06, not 8:05.999…).
export const hours = (value: number | string | null | undefined) => {
  const total = Math.round((Number(value) || 0) * 60);
  const sign = total < 0 ? "-" : "";
  const absolute = Math.abs(total);
  return `${sign}${Math.floor(absolute / 60)}:${String(absolute % 60).padStart(2, "0")}`;
};

export const compactCurrency = (value: number | string | null | undefined) => {
  const amount = Number(value) || 0;
  if (Math.abs(amount) >= 1000) return `₱${(amount / 1000).toFixed(1)}k`;
  return `₱${amount.toFixed(0)}`;
};

export const formatDate = (value: string | Date, pattern = "MMM d, yyyy") => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, pattern);
};

export const formatTime = (value: string | Date) => formatDate(value, "h:mm a");

export const formatDateTime = (value: string | Date) =>
  formatDate(value, "MMM d, h:mm a");

export const todayLabel = () => format(new Date(), "EEEE, MMMM d");

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export const initials = (first?: string, last?: string) => {
  const a = first?.trim().charAt(0) ?? "";
  const b = last?.trim().charAt(0) ?? "";
  return (a + b).toUpperCase() || "TB";
};

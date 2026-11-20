import { format } from "date-fns";

export const currency = (value: number | string | null | undefined) =>
  `₱${(Number(value) || 0).toFixed(2)}`;

export const hours = (value: number | string | null | undefined, digits = 1) =>
  (Number(value) || 0).toFixed(digits);

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

import { AxiosError } from "axios";

type ErrorPayload = {
  message?: string;
  data?: string | string[];
};

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ErrorPayload | undefined;
    if (Array.isArray(payload?.data) && payload.data.length) {
      return payload.data.join(", ");
    }
    if (typeof payload?.data === "string" && payload.data) {
      return payload.data;
    }
    return payload?.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function apiErrorDetails(error: unknown): string[] {
  if (error instanceof AxiosError) {
    const data = (error.response?.data as ErrorPayload | undefined)?.data;
    if (Array.isArray(data)) return data;
    if (typeof data === "string" && data) return [data];
  }
  return [];
}

import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { readUser } from "../lib/auth";
import type { WorkRecord } from "../lib/analytics";

const CACHE_KEY = "recordsCache";

export function useRecords() {
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/records");
      const data: unknown = response.data?.data;

      if (!Array.isArray(data)) {
        setRecords([]);
        return;
      }

      // Preserve per-user isolation where the API exposes an owner field.
      const user = readUser();
      const ownerId = user.id ?? user.user_id;
      const belongsToUser = data.every(
        (record: WorkRecord) =>
          !record.user_id || !ownerId || record.user_id === ownerId
      );

      if (!belongsToUser) {
        console.error("Security: records do not belong to the current user");
        setRecords([]);
        localStorage.removeItem(CACHE_KEY);
        return;
      }

      setRecords(data as WorkRecord[]);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (err) {
      console.error("Failed to fetch records:", err);
      setError("We couldn't load your records. Please try again.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { records, loading, error, refresh, setRecords };
}

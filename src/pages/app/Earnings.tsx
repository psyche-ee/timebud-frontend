import { useEffect, useState } from "react";
import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";
import api from "../../api/axios";

const CACHE_KEY = "earningsCache";
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const DEFAULT_EARNINGS = {
  total: 0,
  this_week: 0,
  this_month: 0,
};

export default function Earnings() {
  const [earnings, setEarnings] = useState(DEFAULT_EARNINGS);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    try {
      const res = await api.get("/earnings");
      const data = res.data?.data || res.data || {};

      if (!data || typeof data !== "object") {
        throw new Error("Invalid earnings data");
      }

      const earningsData = {
        total: data.total ?? 0,
        this_week: data.this_week ?? 0,
        this_month: data.this_month ?? 0,
      };

      setEarnings(earningsData);

      // Always update cache on every visit
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: earningsData, timestamp: Date.now() })
      );
    } catch (err) {
      console.error("Failed to fetch earnings:", err);
      setEarnings(DEFAULT_EARNINGS);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `₱${(value || 0).toFixed(2)}`;
  };

  useEffect(() => {
    // Always fetch fresh data on page visit
    fetchEarnings();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Header />
        <h1 className="text-2xl font-bold text-gray-800">Earnings</h1>

        {/* Total Earnings Card */}
        <div className="bg-primary/10 rounded-3xl shadow-md p-6 flex flex-col items-center justify-center space-y-2">
          <p className="text-sm text-gray-500">Total Earnings</p>
          {loading ? (
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-4xl font-extrabold text-primary">
              {formatCurrency(earnings.total)}
            </p>
          )}
        </div>

        {/* Breakdown Card */}
        <div className="bg-surface rounded-2xl shadow-md p-4 space-y-3">
          <h2 className="font-semibold text-gray-700 text-lg">Breakdown</h2>

          {[
            { key: "this_week", label: "This Week" },
            { key: "this_month", label: "This Month" },
            { key: "total", label: "All Time" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex justify-between py-2 border-b border-gray-100"
            >
              <span className="text-gray-600">{label}</span>
              {loading ? (
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <span className="font-medium text-gray-800">
                  {formatCurrency(earnings[key as keyof typeof earnings])}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
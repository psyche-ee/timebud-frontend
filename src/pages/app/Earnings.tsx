import { useEffect, useState } from "react";
import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";
import api from "../../api/axios";

export default function Earnings() {
  const [earnings, setEarnings] = useState(() => {
    const cached = localStorage.getItem("earningsCache");
    return cached
      ? JSON.parse(cached)
      : { total: 0, this_week: 0, this_month: 0 };
  });

  const [loading, setLoading] = useState(!localStorage.getItem("earningsCache"));

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get("/earnings");

        if (res.data.status === 1) {
          setEarnings(res.data.data);

          // cache data
          localStorage.setItem(
            "earningsCache",
            JSON.stringify(res.data.data)
          );
        }

      } catch (err) {
        console.error("Failed to fetch earnings:", err);
      } finally {
        setLoading(false);
      }
    };

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
          <p className="text-4xl font-extrabold text-primary">
            {loading ? (
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              `₱${earnings.total.toFixed(2)}`
            )}
          </p>
        </div>

        {/* Breakdown Card */}
        <div className="bg-surface rounded-2xl shadow-md p-4 space-y-3">
          <h2 className="font-semibold text-gray-700 text-lg">Breakdown</h2>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">This Week</span>
            <span className="font-medium text-gray-800">
              {loading ? (
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                `₱${earnings.this_week.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">This Month</span>
            <span className="font-medium text-gray-800">
              {loading ? (
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                `₱${earnings.this_month.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-600">All Time</span>
            <span className="font-medium text-gray-800">
              {loading ? (
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                `₱${earnings.total.toFixed(2)}`
              )}
            </span>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
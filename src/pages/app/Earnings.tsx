import { useEffect, useState } from "react";
import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";
import api from "../../api/axios";

export default function Earnings() {
  const [records, setRecords] = useState<any[]>(() => {
    const cached = localStorage.getItem("recordsCache");
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(records.length === 0);

  const [earnings, setEarnings] = useState({
    total: 0,
    this_week: 0,
    this_month: 0,
  });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get("/records");
        const data = res.data.data;

        setRecords(data);
        localStorage.setItem("recordsCache", JSON.stringify(data));

        // compute earnings from records
        computeEarnings(data);

      } catch (err) {
        console.error("Failed to fetch records:", err);
      } finally {
        setLoading(false);
      }
    };

    // only fetch if no cached records
    if (records.length === 0) fetchRecords();
    else computeEarnings(records);
  }, []);

  const computeEarnings = (recordsData: any[]) => {
    const now = new Date();
    let total = 0, thisWeek = 0, thisMonth = 0;

    recordsData.forEach((r) => {
      const earn = r.total_hrs * r.rate_per_hr;
      total += earn;

      const recordDate = new Date(r.time_in);
      const diffDays = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays <= 7) thisWeek += earn;
      if (diffDays <= 30) thisMonth += earn;
    });

    setEarnings({ total, this_week: thisWeek, this_month: thisMonth });
    localStorage.setItem("earningsCache", JSON.stringify({ total, this_week: thisWeek, this_month: thisMonth }));
  };

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
              ₱{earnings.total.toFixed(2)}
            </p>
          )}
        </div>

        {/* Breakdown Card */}
        <div className="bg-surface rounded-2xl shadow-md p-4 space-y-3">
          <h2 className="font-semibold text-gray-700 text-lg">Breakdown</h2>

          {["this_week", "this_month", "total"].map((key) => (
            <div key={key} className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                {key === "this_week" ? "This Week" : key === "this_month" ? "This Month" : "All Time"}
              </span>
              {loading ? (
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <span className="font-medium text-gray-800">
                  ₱{earnings[key as keyof typeof earnings].toFixed(2)}
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
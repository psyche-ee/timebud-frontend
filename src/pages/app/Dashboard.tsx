import { useState, useEffect } from "react";
// import { usePWAInstall } from "../../hooks/usePWAInstall";
import Header from "../../components/Header";
import Logo from "../../assets/earning.svg";
// import Logo2 from "../../assets/logo.svg";
import ActivityCard from "../../components/ActivityCard";
import RecentRecords from "../../components/Records";
import BottomNav from "../../components/BottomNav";
import api from "../../api/axios";
import { toast } from "sonner";

// Store offline actions
const saveOfflineAction = (action: "time-in" | "time-out", timestamp: string) => {
  const offlineQueue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
  offlineQueue.push({ action, timestamp });
  localStorage.setItem("offlineQueue", JSON.stringify(offlineQueue));
};

// Sync offline actions
const syncOfflineActions = async () => {
  const offlineQueue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
  if (!offlineQueue.length) return;

  for (const record of offlineQueue) {
    try {
      await api.post(record.action === "time-in" ? "/time-in" : "/time-out", {
        timestamp: record.timestamp
      });
    } catch (err) {
      console.log("Failed to sync offline record", err);
      return; // stop syncing to retry later
    }
  }

  localStorage.removeItem("offlineQueue"); // clear after successful sync
};

export default function Dashboard() {
  const [showManual, setShowManual] = useState(false);
  const [manualType, setManualType] = useState<"time-in" | "time-out">("time-in");
  const [manualTime, setManualTime] = useState("");

  const [time, setTime] = useState(new Date());
  const [dashboard, setDashboard] = useState<any>(() => {
    const cached = localStorage.getItem("dashboardCache");
    return cached ? JSON.parse(cached) : null;
  });

  const [loading, setLoading] = useState(!dashboard);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const ratePerHr = Number(user.rate_per_hr);

  const handleTimein = async () => {
    const timestamp = new Date().toISOString();

    if (!navigator.onLine) {
      saveOfflineAction("time-in", timestamp);
      toast.success("Time-in recorded offline. Will sync when online.");
      return;
    }

    try {
      const res = await api.post("/time-in", { timestamp });
      if (res.data.status === 1) toast.success(res.data.message);
      else toast.warning(res.data.message);
    } catch (err) {
      saveOfflineAction("time-in", timestamp);
      toast.success("Offline fallback: Time-in will sync later.");
      console.log(err);
    }
  };

  const handleTimeout = async () => {
    const timestamp = new Date().toISOString();

    if (!navigator.onLine) {
      saveOfflineAction("time-out", timestamp);
      toast.success("Time-out recorded offline. Will sync when online.");
      return;
    }

    try {
      const res = await api.post("/time-out", { timestamp });
      if (res.data.status === 1) toast.success(res.data.message);
      else toast.warning(res.data.message);
    } catch (err) {
      saveOfflineAction("time-out", timestamp);
      toast.success("Offline fallback: Time-out will sync later.");
      console.log(err);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualTime) {
      toast.warning("Please select date and time");
      return;
    }

    const timestamp = new Date(manualTime).toISOString();

    if (!navigator.onLine) {
      saveOfflineAction(manualType, timestamp);
      toast.success("Manual record saved offline.");
      setShowManual(false);
      return;
    }

    try {
      const res = await api.post(
        manualType === "time-in" ? "/time-in" : "/time-out",
        { timestamp }
      );

      if (res.data.status === 1) {
        toast.success(res.data.message);
        setShowManual(false);
      } else {
        toast.warning(res.data.message);
      }

    } catch (err) {
      saveOfflineAction(manualType, timestamp);
      toast.success("Saved offline. Will sync later.");
    }
  };

  // Listen for Online Event
  useEffect(() => {
    const handleOnline = () => {
      toast.success("Back online! Syncing offline records...");
      syncOfflineActions();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Digital clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");

        setDashboard(res.data.data);

        // Save cache
        localStorage.setItem(
          "dashboardCache",
          JSON.stringify(res.data.data)
        );

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formattedTime = time.toLocaleTimeString();
  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto p-4 space-y-4 animate-pulse">

          <div className="h-16 bg-gray-200 rounded-xl"></div>

          <div className="h-24 bg-gray-200 rounded-xl"></div>

          <div className="h-24 bg-gray-200 rounded-xl"></div>

          <div className="h-12 bg-gray-200 rounded-xl"></div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-4">

        <Header />
        
        {/* Earnings Card */}
        <div className="bg-surface rounded-xl p-4 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-gray-custom text-sm">Weekly Earnings</p>
            <h2 className="text-2xl font-bold text-primary mt-1">₱{dashboard?.weekly_earnings?.toFixed(2)}</h2>
            <p className="text-highlight text-sm">+₱{dashboard?.today_income?.toFixed(2)} today</p>
            {/* CONDITION MESSAGE */}
            {ratePerHr === 0 && (
              <p className="text-red-500 text-xs mt-2">
                Hourly rate not set. Please set your rate in settings.
              </p>
            )}
          </div>
          <img src={Logo} alt="Logo" />
        </div>

        {/* Modern Digital Clock */}
        <div className="bg-surface text-primary rounded-2xl p-6 text-center shadow-md">

          <p className="text-sm opacity-80">
            {formattedDate}
          </p>

          <h1 className="text-4xl font-bold tracking-wider mt-1">
            {formattedTime}
          </h1>

        </div>

        {/* Time Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-primary text-white py-3 rounded-xl text-lg font-medium" onClick={handleTimein}>
            Time In
          </button>

          <button className="w-full border border-gray-300 text-primary py-3 rounded-xl text-lg font-medium" onClick={handleTimeout}>
            Time Out
          </button>

          <button
            className="w-full border border-primary text-primary py-3 rounded-xl font-medium"
            onClick={() => setShowManual(true)}
          >
            Manual Entry
          </button>
        </div>

        <ActivityCard activity={dashboard?.today_activity} />

        <RecentRecords
          records={dashboard?.past_three_days_records}
          rate={dashboard?.today_income / dashboard?.today_hours || 0}
        />

      </div>

      {showManual && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

        <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm space-y-4">

          <h2 className="text-lg font-semibold text-center">
            Manual Time Entry
          </h2>

          <select
            className="w-full border rounded-lg p-2"
            value={manualType}
            onChange={(e) => setManualType(e.target.value as "time-in" | "time-out")}
          >
            <option value="time-in">Time In</option>
            <option value="time-out">Time Out</option>
          </select>

          <input
            type="datetime-local"
            className="w-full border rounded-lg p-2"
            value={manualTime}
            onChange={(e) => setManualTime(e.target.value)}
          />

          <div className="flex gap-3">

            <button
              className="flex-1 border border-gray-300 py-2 rounded-lg"
              onClick={() => setShowManual(false)}
            >
              Cancel
            </button>

            <button
              className="flex-1 bg-primary text-white py-2 rounded-lg"
              onClick={handleManualSubmit}
            >
              Submit
            </button>

          </div>

        </div>

      </div>
    )}

      <BottomNav />

    </div>
  );
}
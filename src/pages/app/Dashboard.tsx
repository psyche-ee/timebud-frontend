import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Logo from "../../assets/earning.svg";
import { IoTimeOutline } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDateRange } from "react-icons/md";
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
      toast.warning("Please select time");
      return;
    }

    const [hours, minutes] = manualTime.split(":");

    const manualDate = new Date();
    manualDate.setHours(Number(hours));
    manualDate.setMinutes(Number(minutes));
    manualDate.setSeconds(0);
    manualDate.setMilliseconds(0);

    const timestamp = manualDate.toISOString();

    if (!navigator.onLine) {
      saveOfflineAction(manualType, timestamp);
      toast.success("Manual record saved offline.");
      setShowManual(false);
      return;
    }

    try {
      const res = await api.post(
        manualType === "time-in" ? "/manual-time-in" : "/manual-time-out",
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
          <button 
            className="group relative w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-200 overflow-hidden"
            onClick={handleTimein}
          >
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <IoTimeOutline size={20} className="text-white" />
              Time In
            </span>
          </button>

          <button 
            className="group relative border border-primary w-full bg-linear-to-r from-gray-100 to-gray-100 text-primary py-4 px-6 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl hover:from-gray-200 hover:to-gray-300 active:scale-[0.98] transition-all duration-200 overflow-hidden"
            onClick={handleTimeout}
          >
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <IoTimeOutline size={20} className="text-primary" />
              Time Out
            </span>
          </button>

          <button
            className="group relative w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-800 py-4 px-6 rounded-lg text-lg font-semibold shadow-lg hover:shadow-2xl hover:border-gray-300 hover:bg-white active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
            onClick={() => setShowManual(true)}
          >
            <CiEdit size={20} className="text-black" />
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
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowManual(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-white/50 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                 <MdOutlineDateRange size={26} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Manual Entry
                </h2>
                <p className="text-gray-500 text-sm mt-1">Record your time manually</p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 pr-12 text-lg font-semibold shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md cursor-pointer"
                      value={manualType}
                      onChange={(e) => setManualType(e.target.value as "time-in" | "time-out")}
                    >
                      <option value="time-in">Time In</option>
                      <option value="time-out">Time Out</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Time Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    className="w-full bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-lg p-4 text-lg font-semibold text-gray-900 shadow-sm focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 hover:shadow-md invalid:border-red-300"
                    value={manualTime}
                    max={new Date().toTimeString().slice(0,5)}
                    onChange={(e) => setManualTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-10 pt-8 border-t border-gray-100">
                <button
                  className="flex-1 bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold shadow-sm hover:shadow-md hover:from-gray-200 hover:to-gray-300 active:scale-[0.98] transition-all duration-200 border border-gray-200"
                  onClick={() => setShowManual(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={handleManualSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />

    </div>
  );
}
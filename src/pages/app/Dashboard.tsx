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
  const [manualDate, setManualDate] = useState("");
  const [manualTime, setManualTime] = useState("");

  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const [time, setTime] = useState(new Date());
  const [dashboard, setDashboard] = useState<any>(() => {
    const cached = localStorage.getItem("dashboardCache");
    return cached ? JSON.parse(cached) : null;
  });

  const isClockedIn = dashboard?.today_activity?.time_in && !dashboard?.today_activity?.time_out;

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

    // const [hours, minutes] = manualTime.split(":");

    const localDate = new Date(`${manualDate}T${manualTime}`);
    const timestamp = localDate.toISOString(); // UTC

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

  useEffect(() => {
    if (showManual) {
      setManualDate(getCurrentDate());
      setManualTime(getCurrentTime());
    }
  }, [showManual]);

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
        <div className="bg-card dark:border rounded-xl p-4 shadow-sm flex gap-4 items-center">
          <img src={Logo} className="h-32 w-32" alt="Logo" />
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
        </div>

        {/* Modern Digital Clock */}
        <div className="bg-card dark:border text-primary rounded-2xl p-6 text-center shadow-md">
          <div className="mb-4 flex justify-center">
            {isClockedIn ? (
              <span className="px-3 py-1 text-xs rounded-full bg-green-100 border border-green-300 text-green-600 font-semibold">
                🟢 Clocked In
              </span>
            ) : (
              <span className="px-3 py-1 text-xs rounded-full bg-red-100 border border-red-300 text-red-500 font-semibold">
                🔴 Clocked Out
              </span>
            )}
          </div>

          <p className="text-sm opacity-80">
            {formattedDate}
          </p>

          <h1 className="text-4xl font-bold tracking-wider mt-1">
            {formattedTime}
          </h1>

        </div>

        {/* Time Buttons */}
        <div className="space-y-3">

          {/* TIME IN */}
          <button 
            className="relative w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 overflow-hidden flex items-center justify-center"
            onClick={handleTimein}
          >

            {/* Floating Manual Button */}
            <div
              onClick={(e) => {
                e.stopPropagation(); // prevent triggering Time In
                setManualType("time-in");
                setManualTime("");
                setShowManual(true);
              }}
              className="absolute left-3 w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full cursor-pointer transition"
            >
              <CiEdit size={18} />
            </div>

            <span className="flex items-center gap-2">
              <IoTimeOutline size={20} />
              Time In
            </span>
          </button>

          {/* TIME OUT */}
          <button 
            className="relative w-full border border-primary bg-background  text-primary py-4 px-6 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 overflow-hidden flex items-center justify-center"
            onClick={handleTimeout}
          >

            {/* Floating Manual Button */}
            <div
              onClick={(e) => {
                e.stopPropagation(); // prevent triggering Time Out
                setManualType("time-out");
                setManualTime("");
                setShowManual(true);
              }}
              className="absolute left-3 w-9 h-9 flex items-center justify-center bg-gray-300 dark:bg-gray-600 dark:border hover:bg-gray-400 rounded-full cursor-pointer transition"
            >
              <CiEdit size={18} />
            </div>

            <span className="flex items-center gap-2">
              <IoTimeOutline size={20} />
              Time Out
            </span>
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
            <div className="bg-card backdrop-blur-xl rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-white/50 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                 <MdOutlineDateRange size={18} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold">
                    Manual {manualType === "time-in" ? "Time In" : "Time Out"}
                  </h2>
                  <p className="text-gray-500 text-sm">Record your time manually</p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Date Input */}
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-4 py-2"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                  />
                </div>
                {/* Time Input */}
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Time</label>
                  <input
                    type="time"
                    className="time-input w-full bg-white border border-gray-300 text-gray-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    value={manualTime}
                    max={new Date().toTimeString().slice(0,5)}
                    onChange={(e) => setManualTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-10">
                <button
                  className="flex-1 px-4 py-2 bg-transparent border text-secondary text-sm rounded-lg font-semibold shadow-sm hover:shadow-md"
                  onClick={() => setShowManual(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-primary text-white text-sm rounded-lg font-semibold shadow-sm hover:shadow-md"
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
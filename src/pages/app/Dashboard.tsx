import { useState, useEffect } from "react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import Header from "../../components/Header";
import Logo from "../../assets/earning.svg";
import Logo2 from "../../assets/logo.svg";
import ActivityCard from "../../components/ActivityCard";
import RecentRecords from "../../components/Records";
import BottomNav from "../../components/BottomNav";
import api from "../../api/axios";
import { toast } from "sonner";

export default function Dashboard() {
  const { installPWA } = usePWAInstall();
  const [showInstall, setShowInstall] = useState(false);

  const [time, setTime] = useState(new Date());
  const [dashboard, setDashboard] = useState<any>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const ratePerHr = Number(user.rate_per_hr);

  const handleTimein = async () => {
    try {
      const res = await api.post("/time-in");

      if (res.data.status === 1) {
        toast.success(res.data.message);
      } else {
        toast.warning(res.data.message);
      }

    } catch (err) {
      toast.error("Time-in failed");
      console.log(err);
    }
  };

  const handleTimeout = async () => {
    try {
      const res = await api.post("/time-out");

      if (res.data.status === 1) {
        toast.success(res.data.message);
      } else {
        toast.warning(res.data.message);
      }

    } catch (err) {
      toast.error("Time-out failed");
      console.log(err);
    }
  };

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
        console.log('Dashboard data:', res.data.data); 
        setDashboard(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
  }, []);

  // Show install banner
  useEffect(() => {
    const dismissed = localStorage.getItem("pwaInstallDismissed");

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;

    if (dismissed || isStandalone || isIOSStandalone) return;

    const timer = setTimeout(() => {
      setShowInstall(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString();
  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

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
        </div>

        <ActivityCard activity={dashboard?.today_activity} />

        <RecentRecords
          records={dashboard?.past_three_days_records}
          rate={dashboard?.today_income / dashboard?.today_hours || 0}
        />

      </div>

      {/* Install Banner */}
      {showInstall && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowInstall(false)}
          ></div>

          <div className="relative w-[95%] max-w-md mb-20 bg-white rounded-3xl shadow-xl p-6 animate-slide-up">
            <div className="flex items-center gap-4">
              <img
                src={Logo2}
                alt="Logo"
                className="w-12 h-12 rounded-xl"
              />

              <div>
                <h3 className="text-lg font-semibold text-secondary">
                  Install TimeBud
                </h3>

                <p className="text-sm text-gray-500">
                  Install this app for faster access and a better experience.
                </p>
              </div>

            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInstall(false);
                  localStorage.setItem("pwaInstallDismissed", "true");
                }}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Not Now
              </button>
              <button
                onClick={async () => {
                  await installPWA();
                  setShowInstall(false);
                }}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold shadow hover:opacity-90 transition"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />

    </div>
  );
}
import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";
import api from "../../api/axios";
import { usePWAInstall } from "../../hooks/usePWAInstall";

import {
  IoPersonOutline,
  IoLockClosedOutline,
  IoNotificationsOutline,
  IoChevronForward
} from "react-icons/io5";

import { GoDownload } from "react-icons/go";

import { FiLogOut } from "react-icons/fi";

export default function Settings() {
  const { installPWA } = usePWAInstall();
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      console.log("Logout failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <Header />

        <div className="max-w-md mx-auto p-4">

          {/* Title */}
          <h1 className="text-xl font-semibold text-secondary mb-6">
            Settings
          </h1>

          {/* Account Section */}
          <div className="mb-6">

            <p className="text-sm text-muted mb-2">Account</p>

            <div className="bg-surface rounded-2xl shadow-sm divide-y divide-gray-300">

              {/* Profile */}
              <a
                href="/profile"
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">

                  <div className="bg-primary/10 p-2 rounded-lg">
                    <IoPersonOutline className="text-primary text-lg" />
                  </div>

                  <span className="font-medium text-secondary">
                    Profile
                  </span>

                </div>

                <IoChevronForward className="text-muted" />
              </a>

              {/* Change Password */}
              <a
                href="/change-password"
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">

                  <div className="bg-primary/10 p-2 rounded-lg">
                    <IoLockClosedOutline className="text-primary text-lg" />
                  </div>

                  <span className="font-medium text-secondary">
                    Change Password
                  </span>

                </div>

                <IoChevronForward className="text-muted" />
              </a>

            </div>

          </div>

          {/* Notifications Section */}
          <div className="mb-6">

            <p className="text-sm text-muted mb-2">Preferences</p>

            <div className="bg-surface rounded-2xl shadow-sm divide-y">

              <a
                href="/notifications"
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >

                <div className="flex items-center gap-3">

                  <div className="bg-primary/10 p-2 rounded-lg">
                    <IoNotificationsOutline className="text-primary text-lg" />
                  </div>

                  <span className="font-medium text-secondary">
                    Notifications
                  </span>

                </div>

                <IoChevronForward className="text-muted" />

              </a>

            </div>

          </div>

          {/* Installation Section */}
          {!(isStandalone || isIOSStandalone) && (
            <div className="mb-6">

              <p className="text-sm text-muted mb-2">Installation</p>

              <div className="bg-surface rounded-2xl shadow-sm divide-y">

                <button
                  onClick={installPWA}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >

                  <div className="flex items-center gap-3">

                    <div className="bg-primary/10 p-2 rounded-lg">
                      <GoDownload className="text-primary text-lg" />
                    </div>

                    <span className="font-medium text-secondary">
                      Install
                    </span>

                  </div>

                  <IoChevronForward className="text-muted" />

                </button>

              </div>

            </div>
          )}

          {/* Logout */}
          <div className="bg-surface rounded-2xl shadow-sm">

            <button className="flex items-center gap-3 p-4 text-red-500 w-full" onClick={handleLogout}>

              <div className="bg-red-100 p-2 rounded-lg">
                <FiLogOut className="text-red-500 text-lg" />
              </div>

              <span className="font-medium">
                Logout
              </span>

            </button>

          </div>

        </div>
      </div>

      <BottomNav />

    </div>
  );
}
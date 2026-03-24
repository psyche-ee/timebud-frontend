import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

import { ThemeProvider } from "./components/theme-provider"

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Dashboard from "./pages/app/Dashboard";
import Records from "./pages/app/Records";
import Earnings from "./pages/app/Earnings";
import Settings from "./pages/app/Settings";
import Profile from "./pages/app/Profile";
import ChangePassword from "./pages/app/ChangePassword";
import Notifications from "./pages/app/Notifications";
import { Toaster } from "./components/ui/sonner";
import ResetPassword from "./pages/auth/ResetPassword";

function App() {

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("SW registered", reg))
          .catch((err) => console.log("SW registration failed", err));
      });
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected App Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* <Route
            path="/records"
            element={
              <ProtectedRoute>
                <Records />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/records" element={<Records />} />

          {/* <Route
            path="/earnings"
            element={
              <ProtectedRoute>
                <Earnings />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/earnings" element={<Earnings />} />

          {/* <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/settings" element={<Settings />} />

          {/* <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/profile" element={<Profile />} />

          {/* <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/change-password" element={<ChangePassword />} />
          {/* <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
        <Toaster richColors position="top-center" toastOptions={{
            style: {
              background: "var(--color-surface)",
              color: "#111827",
              border: "1px solid #e5e7eb",
            },
          }} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
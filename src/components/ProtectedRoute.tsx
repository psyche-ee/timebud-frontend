// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: React.ReactNode; // Accept any JSX content
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Replace this with your real auth logic
  const isLoggedIn = !!localStorage.getItem("token");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // Render the protected content
};

export default ProtectedRoute;
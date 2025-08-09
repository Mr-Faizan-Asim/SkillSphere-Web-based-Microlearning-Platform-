// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRole, children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    // Not logged in → go to login
    return <Navigate to="/signin" replace />;
  }

  if (userRole?.toLowerCase() !== allowedRole.toLowerCase()) {
    // Logged in but wrong role → unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

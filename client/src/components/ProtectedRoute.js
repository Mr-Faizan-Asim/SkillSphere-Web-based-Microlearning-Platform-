// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRole, children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

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

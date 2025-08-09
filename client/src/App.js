import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./Pages/HomePage";
import HowItWorks from "./components/HowItWorks";
import Register from "./Pages/Register";
import SignInPage from "./Pages/SignInPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LearnerDashboard from "./Pages/LearnerDashboard";

// Dummy dashboard components
const AdminDashboard = () => <h1>Admin Dashboard</h1>;
const MentorDashboard = () => <h1>Mentor Dashboard</h1>;

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/signin" element={<SignInPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/mentor"
              element={
                <ProtectedRoute allowedRole="mentor">
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/learner"
              element={
                  <LearnerDashboard />
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

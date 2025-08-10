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
import FeaturesPage from "./Pages/FeaturesPage";
import PricingPage from "./Pages/PricingPage";
import TeacherDashboard from "./Pages/TeacherDashboard";
import AdminDashboard from "./Pages/AdminDashboard";


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
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} /> 

            {/* Protected routes */}
            <Route
              path="/dashboard/admin"
              element={
                  <AdminDashboard/>
              }
            />
            <Route
              path="/dashboard/mentor"
              element={
                <ProtectedRoute allowedRole="mentor">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/learner"
              element={
                <ProtectedRoute allowedRole="learner">
                  <LearnerDashboard />
                </ProtectedRoute>
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

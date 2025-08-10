import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // Store token & user in both storages
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Force reload to update app state
      if (user.role === "admin") {
        window.location.href = "/dashboard/admin";
      } else if (user.role === "mentor") {
        window.location.href = "/dashboard/mentor";
      } else {
        window.location.href = "/dashboard/learner";
      }

    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 transform transition-all hover:shadow-2xl"
      >
        {/* Logo / Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 text-white font-bold rounded-full w-14 h-14 flex items-center justify-center text-xl shadow-md">
            SS
          </div>
          <h2 className="text-3xl font-bold mt-4 text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Email */}
        <label className="block mb-1 text-gray-700 font-medium">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          required
        />

        {/* Password */}
        <label className="block mb-1 text-gray-700 font-medium">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          required
        />

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg text-lg font-medium shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          Sign In
        </button>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Don’t have an account?{" "}
          <span
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
};

export default SignInPage;

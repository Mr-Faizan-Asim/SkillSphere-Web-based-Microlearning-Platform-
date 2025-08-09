// src/Pages/SessionDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, isBefore } from "date-fns";
import {
  MdCalendarToday,
  MdList,
  MdPendingActions,
  MdHistory,
  MdRefresh,
} from "react-icons/md";

const sidebarItems = [
  { id: "all", label: "All Sessions", icon: <MdList size={24}/> },
  { id: "upcoming", label: "Upcoming", icon: <MdCalendarToday size={24}/> },
  { id: "previous", label: "Previous", icon: <MdHistory size={24}/> },
];

export default function SessionDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const u = sessionStorage.getItem("user") || localStorage.getItem("user");
    const t = sessionStorage.getItem("token") || localStorage.getItem("token");
    setUser(u ? JSON.parse(u) : null);
    setToken(t || null);
  }, []);

  useEffect(() => {
    if (user) fetchSessions();
  }, [user, activeTab]);

  async function fetchSessions() {
    setLoading(true);
    setError("");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint =
        user.role === "mentor"
          ? `sessions/mentor/${user.id || user._id}`
          : `sessions/learner/${user.id || user._id}`;
      const res = await axios.get(`http://localhost:4000/${endpoint}`, { headers });
      const merged = mergePastUpcoming(res.data.past, res.data.upcoming);
      setSessions(filterByTab(merged, activeTab));
    } catch (err) {
      setError("Failed to load sessions. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function mergePastUpcoming(past = [], upcoming = []) {
    return [...upcoming, ...past].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  }

  function filterByTab(list = [], tab) {
    const now = new Date();
    if (tab === "upcoming") return list.filter(s => new Date(s.scheduledAt) >= now);
    if (tab === "previous") return list.filter(s => new Date(s.scheduledAt) < now);
    return list;
  }

  function formatDatePretty(d) {
    try { return format(typeof d === "string" ? parseISO(d) : d, "PPpp"); }
    catch { return String(d); }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-white shadow-lg flex flex-col">
        <div className="flex items-center justify-center h-16 text-indigo-600 text-xl font-bold">
          Sessions
        </div>
        <nav className="flex-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedSession(null); }}
              className={`w-full flex items-center p-4 space-x-3 hover:bg-indigo-100 transition ${
                activeTab === item.id ? "bg-indigo-200" : ""
              }`}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          onClick={fetchSessions}
          className="m-4 p-2 bg-indigo-600 text-white rounded-full mx-auto hover:bg-indigo-700"
          title="Refresh"
        >
          <MdRefresh size={24} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {sidebarItems.find(f => f.id === activeTab)?.label}
        </h2>
        {loading ? (
          <p className="text-gray-600">Loading sessions...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map(s => (
              <div
                key={s._id}
                onClick={() => setSelectedSession(s)}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{s.learnerId?.name || s.learnerId?.email}</h3>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      isBefore(new Date(s.scheduledAt), new Date())
                        ? "bg-gray-200 text-gray-600"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {isBefore(new Date(s.scheduledAt), new Date()) ? "Past" : "Upcoming"}
                  </span>
                </div>
                <p className="text-gray-600">{formatDatePretty(s.scheduledAt)}</p>
                <p className="text-gray-600">Duration: {s.durationMinutes} min</p>
                <p className="capitalize">
                  <strong>Status:</strong> {s.status}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Detail Panel */}
        {selectedSession && (
          <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-white shadow-lg overflow-y-auto p-6">
            <button
              onClick={() => setSelectedSession(null)}
              className="mb-4 text-indigo-600"
            >
              ← Back
            </button>
            <h3 className="text-xl font-bold mb-2">Session Details</h3>
            <p className="text-gray-600 mb-4">
              {formatDatePretty(selectedSession.scheduledAt)}
            </p>
            <div className="space-y-3">
              <div><strong>Duration:</strong> {selectedSession.durationMinutes} minutes</div>
              <div><strong>Channel:</strong> {selectedSession.channel}</div>
              <div><strong>Status:</strong> {selectedSession.status}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

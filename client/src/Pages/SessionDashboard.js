// src/Pages/SessionDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, isBefore } from "date-fns";

const sidebarItems = [
  { id: "all", label: "All Sessions" },
  { id: "upcoming", label: "Upcoming" },
  { id: "previous", label: "Previous" },
];

export default function SessionDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]); // flat list
  const [selectedSession, setSelectedSession] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // read token/user from sessionStorage OR localStorage (fallback)
  useEffect(() => {
    const u = sessionStorage.getItem("user") || localStorage.getItem("user");
    const t = sessionStorage.getItem("token") || localStorage.getItem("token");
    try {
      setUser(u ? JSON.parse(u) : null);
    } catch {
      setUser(null);
    }
    setToken(t || null);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  // Fetch sessions for this user (mentor or learner)
  async function fetchSessions() {
    setLoading(true);
    setError("");
    setSessions([]);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let res;

      // prefer role-based endpoints (server code from earlier)
      if (user.role === "mentor") {
        res = await axios.get(
          `http://localhost:4000/sessions/mentor/${user.id || user._id}`,
          { headers }
        );
        // expected: { past: [...], upcoming: [...] }
        const data = res.data || {};
        const merged = mergePastUpcoming(data.past, data.upcoming);
        setSessions(filterByTab(merged, activeTab));
      } else {
        // learner
        res = await axios.get(
          `http://localhost:4000/sessions/learner/${user.id || user._id}`,
          { headers }
        );
        const data = res.data || {};
        const merged = mergePastUpcoming(data.past, data.upcoming);
        setSessions(filterByTab(merged, activeTab));
      }
    } catch (err) {
      console.error("Fetch sessions error:", err);
      // fallback: try /sessions and filter client-side if your server doesn't have role endpoints
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res2 = await axios.get("http://localhost:4000/sessions", { headers });
        const all = (res2.data || []).filter((s) =>
          (s.mentorId && (s.mentorId._id === (user.id || user._id) || s.mentorId === (user.id || user._id))) ||
          (s.learnerId && (s.learnerId._id === (user.id || user._id) || s.learnerId === (user.id || user._id)))
        );
        setSessions(filterByTab(all, activeTab));
      } catch (err2) {
        console.error("Fallback fetch error:", err2);
        setError("Failed to load sessions. Check server or token.");
      }
    } finally {
      setLoading(false);
    }
  }

  // helper: merge server past/upcoming arrays into one array
  function mergePastUpcoming(past = [], upcoming = []) {
    // ensure unified shape: each session has scheduledAt as Date string and populated mentorId/learnerId objects (if possible)
    const combined = [...upcoming, ...past];
    // sort by scheduledAt asc
    combined.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    return combined;
  }

  // helper: client side tab filter
  function filterByTab(list = [], tab) {
    const now = new Date();
    if (tab === "upcoming") return list.filter((s) => new Date(s.scheduledAt) >= now);
    if (tab === "previous") return list.filter((s) => new Date(s.scheduledAt) < now);
    return list; // all
  }

  function displayRoleLabel(session) {
    if (!user) return "";
    if ((session.learnerId && (session.learnerId._id === (user.id || user._id) || session.learnerId === (user.id || user._id)))) {
      return `You (Learner) → ${session.mentorId?.name || session.mentorId?.email || 'Mentor'}`;
    }
    return `${session.learnerId?.name || session.learnerId?.email || 'Learner'} → You (Mentor)`;
  }

  function formatDatePretty(d) {
    try {
      const dt = typeof d === "string" ? parseISO(d) : d;
      return format(dt, "PPpp"); // e.g., Aug 9, 2025, 3:00 PM
    } catch {
      return String(d);
    }
  }

  async function refresh() {
    await fetchSessions();
  }

  // Session detail view
  const SessionDetails = ({ s }) => {
    if (!s) return null;
    const isPast = isBefore(new Date(s.scheduledAt), new Date());
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <button
          className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setSelectedSession(null)}
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold mb-2">Session Details</h2>
        <p className="text-sm text-gray-600 mb-4">{displayRoleLabel(s)}</p>

        <div className="grid gap-3">
          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-sm text-gray-500">Date & Time</p>
            <p className="font-medium">{formatDatePretty(s.scheduledAt)}</p>
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{s.durationMinutes} minutes</p>
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-sm text-gray-500">Channel</p>
            <p className="font-medium">{s.channel}</p>
            {s.meetingLink && <a className="text-blue-600 underline" href={s.meetingLink} target="_blank" rel="noreferrer">Open meeting link</a>}
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-sm text-gray-500">Notes</p>
            <p>{s.notes || "No notes"}</p>
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium capitalize">{s.status}</p>
          </div>

          <div className="flex gap-3">
            {!isPast && s.status !== "cancelled" && (
              <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => handleCancel(s._id)}>
                Cancel Session
              </button>
            )}

            {user && user.role === "mentor" && s.status === "requested" && (
              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => handleAccept(s._id)}>
                Accept
              </button>
            )}

            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => refresh()}>
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Cancel session (calls PATCH or DELETE depending on your API)
  async function handleCancel(sessionId) {
    if (!token) return setMessageLocal("Missing token");
    try {
      await axios.patch(`http://localhost:4000/sessions/${sessionId}/cancel`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      await fetchSessions();
      setSelectedSession(null);
    } catch (err) {
      console.error("Cancel error", err);
      setError("Failed to cancel session");
    }
  }

  // Accept session (mentor)
  async function handleAccept(sessionId) {
    if (!token) return setError("Missing token");
    try {
      await axios.patch(`http://localhost:4000/sessions/${sessionId}/accept`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      await fetchSessions();
      setSelectedSession(null);
    } catch (err) {
      console.error("Accept error", err);
      setError("Failed to accept session");
    }
  }

  // small helper to set message in local area (not global)
  function setMessageLocal(msg) {
    setError(msg);
    setTimeout(() => setError(""), 3500);
  }

  // Sidebar component (same style)
  const Sidebar = () => (
    <nav className="w-64 bg-gray-100 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Sessions</h2>
      <ul>
        {sidebarItems.map((item) => (
          <li
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSelectedSession(null);
            }}
            className={`cursor-pointer p-2 mb-2 rounded ${activeTab === item.id ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`}
          >
            {item.label}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <button className="w-full px-3 py-2 bg-indigo-600 text-white rounded" onClick={() => fetchSessions()}>
          Refresh
        </button>
      </div>
    </nav>
  );

  // Session list card
  const SessionCard = ({ s }) => {
    const isPast = isBefore(new Date(s.scheduledAt), new Date());
    const left = s.mentorId && (typeof s.mentorId === "object" ? s.mentorId.name : s.mentorId);
    const right = s.learnerId && (typeof s.learnerId === "object" ? s.learnerId.name : s.learnerId);
    return (
      <li
        key={s._id}
        className="border rounded p-4 hover:shadow-lg transition cursor-pointer bg-white"
        onClick={() => setSelectedSession(s)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-semibold">{left} ↔ {right}</h4>
            <p className="text-sm text-gray-500">{formatDatePretty(s.scheduledAt)}</p>
            <p className="text-sm text-gray-500">Duration: {s.durationMinutes} min • Channel: {s.channel}</p>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 rounded text-sm ${isPast ? "bg-gray-200" : "bg-green-100"}`}>
              {isPast ? "Past" : "Upcoming"}
            </span>
            <p className="text-sm mt-2 font-medium">{s.status}</p>
          </div>
        </div>
      </li>
    );
  };

  // list view layout
  const ListView = () => (
    <div className="p-6">
      <h3 className="text-2xl font-semibold mb-4">{activeTab === "all" ? "All Sessions" : (activeTab === "upcoming" ? "Upcoming Sessions" : "Previous Sessions")}</h3>

      {loading ? <p>Loading...</p> : null}
      {error ? <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div> : null}

      {sessions.length === 0 && !loading ? (
        <p>No sessions to show.</p>
      ) : (
        <ul className="space-y-4 max-h-[75vh] overflow-y-auto">
          {sessions.map((s) => <SessionCard key={s._id} s={s} />)}
        </ul>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-grow bg-white p-6">
        {selectedSession ? <SessionDetails s={selectedSession} /> : <ListView />}
      </main>
    </div>
  );
}

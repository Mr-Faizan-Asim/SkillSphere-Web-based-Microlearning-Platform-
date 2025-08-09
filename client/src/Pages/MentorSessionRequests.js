import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaVideo, FaComments, FaSpinner, FaInbox, FaExclamationCircle } from "react-icons/fa";

const filterButtons = [
  { id: "requested", label: "Requested" },
  { id: "confirmed", label: "Confirmed" },
  { id: "rejected", label: "Rejected" },
];

export default function MentorSessionRequests() {
  const [activeFilter, setActiveFilter] = useState("requested");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = JSON.parse(sessionStorage.getItem("user"));
  const mentorId = user?.id;

  useEffect(() => {
    if (!mentorId) return;
    fetchSessions();
  }, [activeFilter, mentorId]);

  async function fetchSessions() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:4000/sessions/mentor/${mentorId}`);
      let data = [...(res.data.upcoming || []), ...(res.data.past || [])];

      data = data.filter((s) => s.status === activeFilter);

      data.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

      setSessions(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load sessions.");
    }
    setLoading(false);
  }

  async function handleAccept(sessionId) {
    try {
      await axios.patch(`http://localhost:4000/sessions/${sessionId}/accept`);
      fetchSessions();
    } catch (err) {
      console.error(err);
      setError("Failed to accept session.");
    }
  }

  async function handleDecline(sessionId) {
    try {
      await axios.patch(`http://localhost:4000/sessions/${sessionId}/decline`);
      fetchSessions();
    } catch (err) {
      console.error(err);
      setError("Failed to decline session.");
    }
  }

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 text-sm rounded-full font-semibold capitalize";
    switch (status) {
      case "requested":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "confirmed":
        return `${base} bg-green-100 text-green-800`;
      case "rejected":
        return `${base} bg-red-100 text-red-800`;
      default:
        return base;
    }
  };

  const getChannelIcon = (channel) => {
    if (channel === "video") return <FaVideo className="inline mr-1 text-blue-500" />;
    if (channel === "chat") return <FaComments className="inline mr-1 text-purple-500" />;
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-md p-6 sticky top-0 h-screen">
        <h2 className="text-2xl font-bold mb-8 border-b pb-3">Session Requests</h2>
        <ul className="space-y-3">
          {filterButtons.map(({ id, label }) => (
            <li
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`cursor-pointer rounded-md px-4 py-2 text-lg font-medium transition-all select-none
                ${
                  activeFilter === id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveFilter(id)}
              aria-pressed={activeFilter === id}
            >
              {label}
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content */}
      <main className="flex-grow p-8">
        <h3 className="text-3xl font-semibold mb-8 text-gray-800">
          {filterButtons.find((f) => f.id === activeFilter)?.label} Sessions
        </h3>

        {/* Loading */}
        {loading && (
          <div className="flex items-center space-x-2 text-gray-600">
            <FaSpinner className="animate-spin text-2xl" />
            <span className="text-lg">Loading sessions...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 mb-6">
            <FaExclamationCircle className="text-xl" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* No Sessions */}
        {!loading && sessions.length === 0 && !error && (
          <div className="flex flex-col items-center text-gray-400 mt-16 space-y-3">
            <FaInbox className="text-6xl" />
            <p className="text-xl font-medium">No sessions found</p>
            <p className="max-w-md text-center">
              There are no sessions with status <strong>{activeFilter}</strong> at the moment.
            </p>
          </div>
        )}

        {/* Sessions List */}
        <div className="grid gap-6">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between transition-transform hover:scale-[1.02]"
              role="group"
              aria-label={`Session with ${session.learnerId?.name || "Unnamed Learner"}`}
            >
              {/* Learner Info */}
              <div className="flex items-center space-x-5 mb-5 md:mb-0 min-w-[250px]">
                <img
                  src={session.learnerId?.avatar || "https://via.placeholder.com/60"}
                  alt={`Avatar of ${session.learnerId?.name || "learner"}`}
                  className="w-14 h-14 rounded-full object-cover border border-gray-300"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-lg text-gray-800">{session.learnerId?.name || "Unnamed Learner"}</p>
                  <p className="text-gray-500 text-sm">{session.learnerId?.email}</p>
                </div>
              </div>

              {/* Session Info */}
              <div className="flex-grow text-gray-700 space-y-2 md:ml-8">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(session.scheduledAt).toLocaleDateString()} at{" "}
                  {new Date(session.scheduledAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>
                  <strong>Duration:</strong> {session.durationMinutes} min
                </p>
                <p>
                  <strong>Channel:</strong> {getChannelIcon(session.channel)} {session.channel}
                </p>
                {session.resources?.title && (
                  <p>
                    <strong>Resource:</strong> {session.resources.title}
                  </p>
                )}
                <p>
                  <span className={getStatusBadge(session.status)}>{session.status}</span>
                </p>
              </div>

              {/* Actions (only for requested) */}
              {activeFilter === "requested" && (
                <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6 md:mt-0 min-w-[180px]">
                  <button
                    onClick={() => handleAccept(session._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                    aria-label={`Accept session with ${session.learnerId?.name || "learner"}`}
                  >
                    <FaCheck /> Accept
                  </button>
                  <button
                    onClick={() => handleDecline(session._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition mt-3 sm:mt-0"
                    aria-label={`Decline session with ${session.learnerId?.name || "learner"}`}
                  >
                    <FaTimes /> Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

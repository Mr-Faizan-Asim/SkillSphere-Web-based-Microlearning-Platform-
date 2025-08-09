import React, { useState } from "react";
import axios from "axios";
import { Calendar, Clock, Video, Mic, MessageSquare, Link as LinkIcon } from "lucide-react";

export default function SessionBookingForm({ mentor, onBack }) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [customDuration, setCustomDuration] = useState("");
  const [channel, setChannel] = useState("video");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const minDateTime = new Date().toISOString().slice(0, 16);
  const presetDurations = [15, 20, 30, 45, 60];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Read token & user from localStorage
    const storedToken = localStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");
    let learnerId = null;
    console.log("Stored User:", JSON.parse(storedUser));
    console.log("Stored Token:", storedToken);
    try {
      learnerId = storedUser ? JSON.parse(storedUser)?.id : null; // "id" not "_id" in your object
    } catch {
      learnerId = null;
    }

    if (!storedToken || !learnerId) {
      setMessage("❌ You must be logged in as a learner to book a session.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/sessions",
        {
          mentorId: mentor._id,
          learnerId, // Include learner ID
          scheduledAt,
          durationMinutes: customDuration ? Number(customDuration) : durationMinutes,
          channel,
          price: price ? Number(price) : undefined,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`, // Send JWT
          },
          withCredentials: true,
        }
      );
      setMessage("✅ Session booked successfully!");
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-xl rounded-xl">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        ← Back to Mentor
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT - Mentor Info */}
        <div className="bg-gray-50 rounded-lg p-5 border">
          <h3 className="text-xl font-bold mb-4">Your Mentor</h3>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold">
              {mentor.name?.[0] || "M"}
            </div>
            <div>
              <p className="font-semibold">{mentor.name || mentor.email}</p>
              <p className="text-sm text-gray-500">Verified Mentor</p>
            </div>
          </div>

          <hr className="my-4" />

          <div className="space-y-2 text-sm">
            <p><strong>Specialties:</strong> {mentor.mentorProfile?.subjects?.join(", ") || "N/A"}</p>
            <p><strong>Tags:</strong> {mentor.mentorProfile?.tags?.join(", ") || "N/A"}</p>
            <p><strong>Rating:</strong> ⭐ {mentor.mentorProfile?.rating || "Not Rated"}</p>
          </div>
        </div>

        {/* RIGHT - Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time */}
          <div>
            <label className="block font-semibold mb-2 flex items-center gap-2">
              <Calendar size={18} /> Date & Time
            </label>
            <input
              type="datetime-local"
              min={minDateTime}
              className="border rounded-lg w-full px-4 py-2"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block font-semibold mb-2 flex items-center gap-2">
              <Clock size={18} /> Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {presetDurations.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`px-4 py-2 rounded-full border ${
                    durationMinutes === d && !customDuration
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => {
                    setDurationMinutes(d);
                    setCustomDuration("");
                  }}
                >
                  {d} min
                </button>
              ))}
              <input
                type="number"
                placeholder="Custom"
                min="5"
                className="px-4 py-2 rounded-full border w-24"
                value={customDuration}
                onChange={(e) => {
                  setCustomDuration(e.target.value);
                  setDurationMinutes("");
                }}
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block font-semibold mb-2">Price (USD)</label>
            <input
              type="number"
              step="0.01"
              className="border rounded-lg w-full px-4 py-2"
              placeholder="e.g. 50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {/* Channel */}
          <div>
            <label className="block font-semibold mb-2">Channel</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "video", label: "Video", icon: <Video size={16} /> },
                { value: "audio", label: "Audio", icon: <Mic size={16} /> },
                { value: "chat", label: "Chat", icon: <MessageSquare size={16} /> },
                { value: "link", label: "Custom Link", icon: <LinkIcon size={16} /> },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg ${
                    channel === opt.value
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => setChannel(opt.value)}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold mb-2">Notes / Description</label>
            <textarea
              rows="4"
              className="border rounded-lg w-full px-4 py-2"
              placeholder="Add any specific topics, goals, or resources you’d like to cover..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white py-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white w-full py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
            >
              {loading ? "Booking..." : "Book Session"}
            </button>
          </div>
        </form>
      </div>

      {message && <p className="mt-6 text-center font-medium">{message}</p>}
    </div>
  );
}

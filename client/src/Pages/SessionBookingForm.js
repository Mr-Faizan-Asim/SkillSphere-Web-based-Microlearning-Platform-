import React, { useState } from "react";
import axios from "axios";
import { Calendar, Clock, Video, Mic, MessageSquare, Link as LinkIcon, Plus, Trash } from "lucide-react";

export default function SessionBookingForm({ mentor, onBack }) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [customDuration, setCustomDuration] = useState("");
  const [channel, setChannel] = useState("video");
  const [price, setPrice] = useState("");
  const [resources, setResources] = useState([{ title: "", url: "" }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const minDateTime = new Date().toISOString().slice(0, 16);
  const presetDurations = [15, 20, 30, 45, 60];

  const handleResourceChange = (index, field, value) => {
    const updated = [...resources];
    updated[index][field] = value;
    setResources(updated);
  };

  const addResource = () => {
    setResources([...resources, { title: "", url: "" }]);
  };

  const removeResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const storedToken = localStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");
    let learnerId = null;

    try {
      learnerId = storedUser ? JSON.parse(storedUser)?.id : null;
    } catch {
      learnerId = null;
    }

    if (!storedToken || !learnerId) {
      setMessage("❌ You must be logged in as a learner to book a session.");
      setLoading(false);
      return;
    }

    if (resources.length === 0 || resources.some(r => !r.title.trim() || !r.url.trim())) {
      setMessage("❌ Please provide a title and URL for at least one resource.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/sessions",
        {
          mentorId: mentor._id,
          learnerId,
          scheduledAt,
          durationMinutes: customDuration ? Number(customDuration) : durationMinutes,
          channel,
          price: price ? Number(price) : undefined,
          resources
        },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
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

          {/* Resources */}
          <div>
            <label className="block font-semibold mb-2">Resources</label>
            {resources.map((res, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Title"
                  className="border rounded-lg px-3 py-2 flex-1"
                  value={res.title}
                  onChange={(e) => handleResourceChange(index, "title", e.target.value)}
                  required
                />
                <input
                  type="url"
                  placeholder="URL"
                  className="border rounded-lg px-3 py-2 flex-1"
                  value={res.url}
                  onChange={(e) => handleResourceChange(index, "url", e.target.value)}
                  required
                />
                {resources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeResource(index)}
                    className="bg-red-500 text-white px-3 rounded-lg hover:bg-red-600"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addResource}
              className="flex items-center gap-2 mt-2 text-blue-600 hover:underline"
            >
              <Plus size={16} /> Add Resource
            </button>
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

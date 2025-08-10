import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    interests: [],
    goals: [],
    languages: [],
    avatarUrl: "",
    mentorProfile: {
      bio: "",
      subjects: [],
      tags: [],
      hourlyRate: "",
      certifications: [],
      timezone: "",
    },
  });
  const [role, setRole] = useState("learner");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError("");
    axios
      .get(`http://localhost:4000/users/${userId}`)
      .then(({ data }) => {
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          location: data.location || "",
          interests: data.interests || [],
          goals: data.goals || [],
          languages: data.languages || [],
          avatarUrl: data.avatarUrl || "",
          mentorProfile: {
            bio: data.mentorProfile?.bio || "",
            subjects: data.mentorProfile?.subjects || [],
            tags: data.mentorProfile?.tags || [],
            hourlyRate: data.mentorProfile?.hourlyRate || "",
            certifications: data.mentorProfile?.certifications || [],
            timezone: data.mentorProfile?.timezone || "",
          },
        });
        setRole(data.role || "learner");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("mentorProfile.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        mentorProfile: { ...prev.mentorProfile, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    const arr = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (name.startsWith("mentorProfile.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        mentorProfile: { ...prev.mentorProfile, [key]: arr },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: arr }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSaving(true);
    try {
      await axios.put(`http://localhost:4000/users/${userId}`, formData, {
        withCredentials: true,
      });
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="md:w-72 bg-white shadow-lg p-8 sticky top-0 h-40 md:h-screen flex flex-col justify-center">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-6 tracking-wide">
          Edit Profile
        </h2>
        <p className="text-blue-600 leading-relaxed text-lg">
          Update your personal and{" "}
          <span className="font-semibold text-blue-800">
            {role === "mentor" ? "mentor" : "learner"}
          </span>{" "}
          details here.
        </p>
      </nav>

      {/* Main content */}
      <main className="flex-grow p-10 max-w-4xl mx-auto w-full">
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading profile...</p>
        ) : (
          <>
            {error && (
              <div
                role="alert"
                className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow flex items-center gap-3"
              >
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-9-4a1 1 0 012 0v4a1 1 0 01-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {successMsg && (
              <div
                role="alert"
                className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg shadow"
              >
                {successMsg}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-8 bg-white p-8 rounded-xl shadow-md"
              noValidate
            >
              {/* General Info Section */}
              <section className="space-y-6">
                <h3 className="text-2xl font-semibold border-b border-blue-200 pb-2 mb-4 text-blue-700">
                  Personal Information
                </h3>

                <label className="block">
                  <span className="text-gray-700 font-medium mb-1 block">Name</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                    placeholder="Your full name"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 font-medium mb-1 block">Bio</span>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about yourself"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 font-medium mb-1 block">Location</span>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <label className="block">
                    <span className="text-gray-700 font-medium mb-1 block">
                      Interests
                    </span>
                    <input
                      type="text"
                      name="interests"
                      value={formData.interests.join(", ")}
                      onChange={handleArrayChange}
                      placeholder="e.g., Coding, Reading"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                    />
                  </label>

                  <label className="block">
                    <span className="text-gray-700 font-medium mb-1 block">Goals</span>
                    <input
                      type="text"
                      name="goals"
                      value={formData.goals.join(", ")}
                      onChange={handleArrayChange}
                      placeholder="e.g., Become a mentor"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                    />
                  </label>

                  <label className="block">
                    <span className="text-gray-700 font-medium mb-1 block">Languages</span>
                    <input
                      type="text"
                      name="languages"
                      value={formData.languages.join(", ")}
                      onChange={handleArrayChange}
                      placeholder="e.g., English, Urdu"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-gray-700 font-medium mb-1 block">Avatar URL</span>
                  <input
                    type="url"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                  />
                </label>
              </section>

              {/* Mentor Section */}
              {role === "mentor" && (
                <section className="space-y-6">
                  <h3 className="text-2xl font-semibold border-b border-blue-200 pb-2 mb-4 text-blue-700">
                    Mentor Profile
                  </h3>

                  <label className="block">
                    <span className="text-gray-700 font-medium mb-1 block">
                      Mentor Bio
                    </span>
                    <textarea
                      name="mentorProfile.bio"
                      value={formData.mentorProfile.bio}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe your mentoring style and experience"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                    />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <label className="block">
                      <span className="text-gray-700 font-medium mb-1 block">
                        Subjects
                      </span>
                      <input
                        type="text"
                        name="mentorProfile.subjects"
                        value={formData.mentorProfile.subjects.join(", ")}
                        onChange={handleArrayChange}
                        placeholder="Comma separated"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                      />
                    </label>

                    <label className="block">
                      <span className="text-gray-700 font-medium mb-1 block">Tags</span>
                      <input
                        type="text"
                        name="mentorProfile.tags"
                        value={formData.mentorProfile.tags.join(", ")}
                        onChange={handleArrayChange}
                        placeholder="Comma separated"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                      />
                    </label>

                    <label className="block">
                      <span className="text-gray-700 font-medium mb-1 block">
                        Certifications
                      </span>
                      <input
                        type="text"
                        name="mentorProfile.certifications"
                        value={formData.mentorProfile.certifications.join(", ")}
                        onChange={handleArrayChange}
                        placeholder="Comma separated"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="block">
                      <span className="text-gray-700 font-medium mb-1 block">
                        Hourly Rate ($)
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="mentorProfile.hourlyRate"
                        value={formData.mentorProfile.hourlyRate}
                        onChange={handleChange}
                        placeholder="e.g., 25"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                      />
                    </label>

                    <label className="block">
                      <span className="text-gray-700 font-medium mb-1 block">
                        Timezone
                      </span>
                      <input
                        type="text"
                        name="mentorProfile.timezone"
                        value={formData.mentorProfile.timezone}
                        onChange={handleChange}
                        placeholder="e.g., GMT+5"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400"
                      />
                    </label>
                  </div>
                </section>
              )}

              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3 rounded-lg text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  saving ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
                aria-busy={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

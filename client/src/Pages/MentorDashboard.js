import React, { useState, useEffect } from "react";
import axios from "axios";

const sidebarItems = [
  { id: "mentor-list", label: "Mentor List" },
  { id: "best-rated", label: "Best Rated" },
  { id: "profile", label: "My Profile" },
];

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState("mentor-list");
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Fetch mentors when dashboard loads or activeTab is mentor-list or best-rated
  useEffect(() => {
    if (activeTab === "mentor-list" || activeTab === "best-rated") {
      fetchMentors();
    }
  }, [activeTab]);

  async function fetchMentors() {
    try {
      if (activeTab === "mentor-list") {
        const res = await axios.get("http://localhost:4000/mentors");
        setMentors(res.data.data || []);
      } else if (activeTab === "best-rated") {
        const res = await axios.get("http://localhost:4000/mentors/best-rated");
        setMentors(res.data.data || []);
      }
      setSelectedMentor(null); // Reset selected mentor on list change
    } catch (err) {
      console.error(err);
    }
  }

  // Fetch and show details for clicked mentor
  async function showMentorDetails(id) {
    try {
      const res = await axios.get(`http://localhost:4000/mentors/${id}`);
      setSelectedMentor(res.data);
      setActiveTab("mentor-details");
    } catch (err) {
      console.error(err);
    }
  }

  // Sidebar navigation component
  const Sidebar = () => (
    <nav className="w-64 bg-gray-100 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Mentor Dashboard</h2>
      <ul>
        {sidebarItems.map((item) => (
          <li
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSelectedMentor(null); // Clear details when switching tabs
            }}
            className={`cursor-pointer p-2 mb-2 rounded ${
              activeTab === item.id ? "bg-blue-500 text-white" : "hover:bg-blue-100"
            }`}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </nav>
  );

  // Mentor List tab UI
  const MentorListTab = () => (
    <div className="p-6 overflow-auto">
      <h3 className="text-2xl font-semibold mb-4">Mentor List</h3>
      {mentors.length === 0 ? (
        <p>No mentors found.</p>
      ) : (
        <ul className="space-y-4 max-h-[70vh] overflow-y-auto">
          {mentors.map((mentor) => (
            <li
              key={mentor._id}
              className="border rounded p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => showMentorDetails(mentor._id)}
            >
              <h4 className="text-xl font-semibold">{mentor.name || mentor.email}</h4>
              <p>Rating: {mentor.mentorProfile?.rating || "No ratings"}</p>
              <p>Subjects: {mentor.mentorProfile?.subjects?.join(", ") || "N/A"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Best Rated tab UI (reuse MentorListTab style)
  const BestRatedTab = () => (
    <div className="p-6 overflow-auto">
      <h3 className="text-2xl font-semibold mb-4">Best Rated Mentors</h3>
      {mentors.length === 0 ? (
        <p>No mentors are rated yet.</p>
      ) : (
        <ul className="space-y-4 max-h-[70vh] overflow-y-auto">
          {mentors.map((mentor) => (
            <li
              key={mentor._id}
              className="border rounded p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => showMentorDetails(mentor._id)}
            >
              <h4 className="text-xl font-semibold">{mentor.name || mentor.email}</h4>
              <p>Rating: {mentor.mentorProfile?.rating}</p>
              <p>Subjects: {mentor.mentorProfile?.subjects?.join(", ") || "N/A"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Mentor details UI (shown when mentor clicked)
  const MentorDetailsTab = () => {
    if (!selectedMentor) return <p>Loading mentor details...</p>;

    const m = selectedMentor;
    return (
      <div className="p-6 overflow-auto max-h-[80vh]">
        <button
          className="mb-4 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => setActiveTab("mentor-list")}
        >
          ← Back to List
        </button>
        <h2 className="text-3xl font-bold mb-4">{m.name || m.email}</h2>
        <p><strong>Bio:</strong> {m.mentorProfile?.bio || "No bio"}</p>
        <p><strong>Subjects:</strong> {m.mentorProfile?.subjects?.join(", ") || "N/A"}</p>
        <p><strong>Tags:</strong> {m.mentorProfile?.tags?.join(", ") || "N/A"}</p>
        <p><strong>Portfolio:</strong></p>
        <ul className="list-disc list-inside mb-4">
          {m.mentorProfile?.portfolio?.length ? (
            m.mentorProfile.portfolio.map((item, i) => (
              <li key={i}>
                <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {item.title}
                </a>
              </li>
            ))
          ) : (
            <li>No portfolio items</li>
          )}
        </ul>
        <p><strong>Rating:</strong> {m.mentorProfile?.rating || "No ratings"}</p>
        <p><strong>Hourly Rate:</strong> {m.mentorProfile?.hourlyRate || "N/A"}</p>
        <p><strong>Languages:</strong> {m.mentorProfile?.languages?.join(", ") || "N/A"}</p>
        <p><strong>Timezone:</strong> {m.mentorProfile?.timezone || "N/A"}</p>
        <p><strong>Certifications:</strong> {m.mentorProfile?.certifications?.join(", ") || "N/A"}</p>
      </div>
    );
  };

  // Mentor profile form (reuse your MentorProfileForm or inline simple form here)
  const MentorProfileTab = () => (
    <div className="p-6">
      <h3 className="text-2xl font-semibold mb-4">My Mentor Profile</h3>
      {/* You can import and embed your MentorProfileForm component here */}
      <p>Profile form goes here (or import your existing MentorProfileForm)</p>
    </div>
  );

  // Main content switcher
  const renderContent = () => {
    switch (activeTab) {
      case "mentor-list":
        return <MentorListTab />;
      case "best-rated":
        return <BestRatedTab />;
      case "mentor-details":
        return <MentorDetailsTab />;
      case "profile":
        return <MentorProfileTab />;
      default:
        return <MentorListTab />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-grow bg-white">{renderContent()}</main>
    </div>
  );
}

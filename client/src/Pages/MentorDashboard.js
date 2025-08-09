import React, { useState, useEffect } from "react";
import axios from "axios";
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from "recharts";
import SessionBookingForm from "./SessionBookingForm"; 


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

    // Prepare subject data for chart
    const subjectData = (m.mentorProfile?.subjects || []).map((sub, idx) => ({
        name: sub,
        value: Math.floor(Math.random() * 100) + 50, // Simulated skill percentage
        fill: `hsl(${idx * 60}, 70%, 50%)`,
    }));

    return (
        <div className="p-6 overflow-auto max-h-[85vh] bg-gray-50 rounded-lg shadow-lg">
        <button
            className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
            onClick={() => setActiveTab("mentor-list")}
        >
            ← Back to List
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
            <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name || m.email}`}
            alt="Mentor avatar"
            className="w-20 h-20 rounded-full border"
            />
            <div>
            <h2 className="text-3xl font-bold">{m.name || m.email}</h2>
            <p className="text-gray-600">{m.mentorProfile?.bio || "No bio provided"}</p>
            </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Details</h3>
            <p><strong>Rating:</strong> ⭐ {m.mentorProfile?.rating || "No ratings"}</p>
            <p><strong>Hourly Rate:</strong> {m.mentorProfile?.hourlyRate || "N/A"}</p>
            <p><strong>Languages:</strong> {m.mentorProfile?.languages?.join(", ") || "N/A"}</p>
            <p><strong>Timezone:</strong> {m.mentorProfile?.timezone || "N/A"}</p>
            <p><strong>Certifications:</strong> {m.mentorProfile?.certifications?.join(", ") || "N/A"}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Subject Proficiency</h3>
            {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="90%"
                    barSize={15}
                    data={subjectData}
                >
                    <RadialBar minAngle={15} label={{ position: "insideStart", fill: "#fff" }} background clockWise dataKey="value" />
                    <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
                    <Tooltip />
                </RadialBarChart>
                </ResponsiveContainer>
            ) : (
                <p>No subjects available</p>
            )}
            </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white rounded-lg shadow p-4 mt-6">
            <h3 className="text-lg font-semibold mb-2">Portfolio</h3>
            <ul className="list-disc list-inside space-y-1">
            {m.mentorProfile?.portfolio?.length ? (
                m.mentorProfile.portfolio.map((item, i) => (
                <li key={i}>
                    <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                    >
                    {item.title}
                    </a>
                </li>
                ))
            ) : (
                <li>No portfolio items</li>
            )}
            </ul>
        </div>

        {/* Action */}
        <button
            className="mt-6 px-5 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
            onClick={() => setActiveTab("session-form")}
        >
            Schedule a Session
        </button>
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
      case "session-form":
        return <SessionBookingForm mentor={selectedMentor} onBack={() => setActiveTab("mentor-details")} />;
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

import React, { useEffect, useState } from "react";
import axios from "axios";

const sidebarItems = [
  { id: "mentors", label: "Mentors" },
  { id: "sessions", label: "Sessions" },
  { id: "previous", label: "Previous Details" },
  { id: "create-session", label: "Create Session" },
];

export default function LearnerDashboard() {
  const [activeTab, setActiveTab] = useState("mentors");
  const [mentors, setMentors] = useState([]);
  const [filters, setFilters] = useState({ skill: "", rating: "" });
  const [filteredMentors, setFilteredMentors] = useState([]);

  // Fetch all mentors on load
  useEffect(() => {
    async function fetchMentors() {
      try {
        const res = await axios.get("http://localhost:4000/mentors");
        setMentors(res.data);
        setFilteredMentors(res.data);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      }
    }
    fetchMentors();
  }, []);

  // Filter mentors when filters change
  useEffect(() => {
    let filtered = [...mentors];

    if (filters.skill) {
      filtered = filtered.filter((mentor) =>
        mentor.subjects?.some((sub) =>
          sub.toLowerCase().includes(filters.skill.toLowerCase())
        )
      );
    }

    if (filters.rating) {
      filtered = filtered.filter(
        (mentor) => mentor.rating >= parseFloat(filters.rating)
      );
    }

    setFilteredMentors(filtered);
  }, [filters, mentors]);

  // Handle filter changes
  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  // UI for sidebar navigation
  const Sidebar = () => (
    <nav className="w-64 bg-gray-100 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Learner Dashboard</h2>
      <ul>
        {sidebarItems.map((item) => (
          <li
            key={item.id}
            onClick={() => setActiveTab(item.id)}
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

  // UI for mentors tab with filters and list
  const MentorsTab = () => (
    <div className="p-6">
      <h3 className="text-2xl font-semibold mb-4">Available Mentors</h3>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by skill"
          name="skill"
          value={filters.skill}
          onChange={handleFilterChange}
          className="border p-2 rounded w-48"
        />
        <select
          name="rating"
          value={filters.rating}
          onChange={handleFilterChange}
          className="border p-2 rounded w-32"
        >
          <option value="">Filter by rating</option>
          <option value="4">4+ stars</option>
          <option value="3">3+ stars</option>
          <option value="2">2+ stars</option>
          <option value="1">1+ star</option>
        </select>
      </div>

      {/* Mentors List */}
      {filteredMentors.length === 0 ? (
        <p>No mentors found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredMentors.map((mentor) => (
            <li
              key={mentor._id}
              className="border rounded p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => alert(`You clicked mentor: ${mentor.name || mentor.email}`)}
            >
              <h4 className="text-xl font-semibold">{mentor.name || mentor.email}</h4>
              <p>
                <strong>Subjects:</strong>{" "}
                {mentor.subjects ? mentor.subjects.join(", ") : "N/A"}
              </p>
              <p>
                <strong>Rating:</strong> {mentor.rating || "No ratings"}
              </p>
              <p>{mentor.bio || "No bio provided"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Placeholder components for other tabs
  const SessionsTab = () => (
    <div className="p-6">
      <h3 className="text-2xl font-semibold mb-4">Your Sessions</h3>
      <p>Coming soon...</p>
    </div>
  );
  const PreviousDetailsTab = () => (
    <div className="p-6">
      <h3 className="text-2xl font-semibold mb-4">Previous Details</h3>
      <p>Coming soon...</p>
    </div>
  );
  const CreateSessionTab = () => (
    <div className="p-6">
      <h3 className="text-2xl font-semibold mb-4">Create Session with Mentor</h3>
      <p>Coming soon...</p>
    </div>
  );

  // Main content switcher
  const renderContent = () => {
    switch (activeTab) {
      case "mentors":
        return <MentorsTab />;
      case "sessions":
        return <SessionsTab />;
      case "previous":
        return <PreviousDetailsTab />;
      case "create-session":
        return <CreateSessionTab />;
      default:
        return <MentorsTab />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow bg-white">{renderContent()}</div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from "recharts";
import SessionBookingForm from "./SessionBookingForm";
import { FaSearch, FaStar } from "react-icons/fa";

const sidebarItems = [
  { id: "mentor-list", label: "Mentor List", icon: <FaStar /> },
  { id: "best-rated", label: "Best Rated", icon: <FaStar /> },
  { id: "profile", label: "My Profile", icon: <FaStar /> },
];

const ratingOptions = [
  { value: 0, label: "All Ratings" },
  { value: 1, label: "1+ Stars" },
  { value: 2, label: "2+ Stars" },
  { value: 3, label: "3+ Stars" },
  { value: 4, label: "4+ Stars" },
  { value: 5, label: "5 Stars Only" },
];

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState("mentor-list");
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState(0);

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
      setSelectedMentor(null);
      setSearchTerm("");
      setMinRating(0);
    } catch (err) {
      console.error(err);
    }
  }

  async function showMentorDetails(id) {
    try {
      const res = await axios.get(`http://localhost:4000/mentors/${id}`);
      setSelectedMentor(res.data);
      setActiveTab("mentor-details");
    } catch (err) {
      console.error(err);
    }
  }

  const filteredMentors = mentors.filter((mentor) => {
    const rating = mentor.mentorProfile?.rating || 0;
    if (rating < minRating) return false;

    const search = searchTerm.toLowerCase();
    if (!search) return true;

    const name = (mentor.name || "").toLowerCase();
    const email = (mentor.email || "").toLowerCase();
    const subjects = (mentor.mentorProfile?.subjects || []).join(" ").toLowerCase();

    return name.includes(search) || email.includes(search) || subjects.includes(search);
  });

  // Sidebar updated for modern UI
  const Sidebar = () => (
   <nav className="w-64 bg-gray-100 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Mentor Dashboard</h2>
      <ul>
        {sidebarItems.map((item) => (
          <li
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSelectedMentor(null);
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

  // Filters with icons and better spacing + rounded-pill inputs
  const Filters = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-6 gap-3">
      <div className="relative flex-grow">
        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search by name, email, or subject..."
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search mentors"
        />
      </div>

      <select
        className="border border-gray-300 rounded-full px-4 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={minRating}
        onChange={(e) => setMinRating(Number(e.target.value))}
        aria-label="Filter mentors by minimum rating"
      >
        {ratingOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );

  // Scrollbar styles for mentor lists
  const scrollStyle = "max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100";

  const MentorListTab = () => (
    <div className="p-6 overflow-auto">
      <h3 className="text-3xl font-semibold mb-6 tracking-wide">Mentor List</h3>
      <Filters />
      {filteredMentors.length === 0 ? (
        <p className="text-gray-600 text-center mt-20 text-lg select-none">No mentors found matching the criteria.</p>
      ) : (
        <ul className={`${scrollStyle} space-y-5`}>
          {filteredMentors.map((mentor) => (
            <li
              key={mentor._id}
              className="border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition cursor-pointer bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              onClick={() => showMentorDetails(mentor._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") showMentorDetails(mentor._id);
              }}
              aria-label={`View details for ${mentor.name || mentor.email}`}
            >
              <div>
                <h4 className="text-2xl font-semibold text-blue-700">{mentor.name || mentor.email}</h4>
                <p className="mt-1 text-gray-600">
                  <FaStar className="inline text-yellow-400 mr-1" />
                  {mentor.mentorProfile?.rating || "No ratings"}
                </p>
              </div>
              <div className="text-gray-500 italic max-w-xs truncate">
                Subjects: {mentor.mentorProfile?.subjects?.join(", ") || "N/A"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const BestRatedTab = () => (
    <div className="p-6 overflow-auto">
      <h3 className="text-3xl font-semibold mb-6 tracking-wide">Best Rated Mentors</h3>
      <Filters />
      {filteredMentors.length === 0 ? (
        <p className="text-gray-600 text-center mt-20 text-lg select-none">No mentors found matching the criteria.</p>
      ) : (
        <ul className={`${scrollStyle} space-y-5`}>
          {filteredMentors.map((mentor) => (
            <li
              key={mentor._id}
              className="border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition cursor-pointer bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              onClick={() => showMentorDetails(mentor._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") showMentorDetails(mentor._id);
              }}
              aria-label={`View details for ${mentor.name || mentor.email}`}
            >
              <div>
                <h4 className="text-2xl font-semibold text-blue-700">{mentor.name || mentor.email}</h4>
                <p className="mt-1 text-gray-600">
                  <FaStar className="inline text-yellow-400 mr-1" />
                  {mentor.mentorProfile?.rating || "No ratings"}
                </p>
              </div>
              <div className="text-gray-500 italic max-w-xs truncate">
                Subjects: {mentor.mentorProfile?.subjects?.join(", ") || "N/A"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // MentorDetailsTab and MentorProfileTab remain unchanged, but you can style buttons there similarly if you want.

  const MentorDetailsTab = () => {
    if (!selectedMentor) return <p>Loading mentor details...</p>;

    const m = selectedMentor;

    const subjectData = (m.mentorProfile?.subjects || []).map((sub, idx) => ({
      name: sub,
      value: Math.floor(Math.random() * 100) + 50,
      fill: `hsl(${idx * 60}, 70%, 50%)`,
    }));

    return (
      <div className="p-6 overflow-auto max-h-[85vh] bg-gray-50 rounded-lg shadow-lg">
        <button
          className="mb-4 px-5 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-green-500 hover:to-blue-600 transition"
          onClick={() => setActiveTab("mentor-list")}
        >
          ← Back to List
        </button>

        <div className="flex items-center gap-6 mb-6">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name || m.email}`}
            alt="Mentor avatar"
            className="w-24 h-24 rounded-full border-4 border-blue-500"
          />
          <div>
            <h2 className="text-4xl font-extrabold text-blue-700">{m.name || m.email}</h2>
            <p className="text-gray-700 mt-2 max-w-xl">{m.mentorProfile?.bio || "No bio provided"}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3">Details</h3>
            <p className="mb-2">
              <strong>Rating:</strong>{" "}
              <span className="inline-flex items-center gap-1 text-yellow-400">
                <FaStar /> {m.mentorProfile?.rating || "No ratings"}
              </span>
            </p>
            <p className="mb-2">
              <strong>Hourly Rate:</strong> {m.mentorProfile?.hourlyRate || "N/A"}
            </p>
            <p className="mb-2">
              <strong>Languages:</strong> {m.mentorProfile?.languages?.join(", ") || "N/A"}
            </p>
            <p className="mb-2">
              <strong>Timezone:</strong> {m.mentorProfile?.timezone || "N/A"}
            </p>
            <p className="mb-2">
              <strong>Certifications:</strong> {m.mentorProfile?.certifications?.join(", ") || "N/A"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Subject Proficiency</h3>
            {subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={15} data={subjectData}>
                  <RadialBar
                    minAngle={15}
                    label={{ position: "insideStart", fill: "#fff" }}
                    background
                    clockWise
                    dataKey="value"
                  />
                  <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <p>No subjects available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h3 className="text-xl font-semibold mb-3">Portfolio</h3>
          <ul className="list-disc list-inside space-y-2 max-w-xl">
            {m.mentorProfile?.portfolio?.length ? (
              m.mentorProfile.portfolio.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline hover:text-blue-800 transition"
                  >
                    {item.title}
                  </a>
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic">No portfolio items</li>
            )}
          </ul>
        </div>

        <button
          className="mt-8 px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-blue-700 transition"
          onClick={() => setActiveTab("session-form")}
        >
          Schedule a Session
        </button>
      </div>
    );
  };

  const MentorProfileTab = () => (
    <div className="p-6">
      <h3 className="text-3xl font-semibold mb-6 tracking-wide">My Mentor Profile</h3>
      <p className="text-gray-700 select-none">Profile form goes here (or import your existing MentorProfileForm)</p>
    </div>
  );

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-grow bg-white shadow-inner">{renderContent()}</main>
    </div>
  );
}

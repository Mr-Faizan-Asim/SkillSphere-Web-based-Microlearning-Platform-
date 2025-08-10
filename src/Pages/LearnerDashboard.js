import React, { useState } from "react";
import MentorDashboard from "./MentorDashboard";
import SessionDashboard from "./SessionDashboard";
import AvatarPage from "./AvatarPage";

const sidebarItems = [
  { id: "mentors", label: "Mentors" },
  { id: "sessions", label: "Sessions" },
  { id: "AI Teacher", label: "AI Teacher" },
  { id: "talknode", label: "TalkNode", external: true, url: "https://talknode.netlify.app/" },
];

export default function LearnerDashboard() {
  const [activeTab, setActiveTab] = useState("mentors");
  const [sidebarHovered, setSidebarHovered] = useState(false);

  // Sidebar styles change on hover to expand/collapse
  const sidebarWidth = sidebarHovered ? "w-48" : "w-16";

  // Content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "mentors":
        return <MentorDashboard />;
      case "sessions":
        return (
          <SessionDashboard/>
        );
      case "AI Teacher":
        return (
          <AvatarPage topic="Pointers" />
        );
      case "talkNode":
        window.location.href = "https://talknode.netlify.app/";
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <nav
        className={`bg-gray-100 min-h-screen transition-all duration-300 ease-in-out overflow-hidden ${sidebarWidth}`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="flex flex-col items-center py-6 space-y-6">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center w-full px-4 py-2 space-x-3 rounded
                ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-200"
                }`}
            >
              {/* Icon placeholders */}
              <span className="text-lg font-bold">
                {item.label.charAt(0)}
              </span>
              {/* Show label only if expanded */}
              {sidebarHovered && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow bg-white">{renderContent()}</main>
    </div>
  );
}

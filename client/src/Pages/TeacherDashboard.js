import React, { useState } from "react";
import MentorSessionRequests from "./MentorSessionRequests";


const sidebarItems = [
  { id: "sessions", label: "Sessions" },
  { id: "ratings", label: "Previous Ratings" },
  { id: "profile", label: "Profile Update" },
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("sessions");
  const [sidebarHovered, setSidebarHovered] = useState(false);

  // Sidebar expand/collapse width
  const sidebarWidth = sidebarHovered ? "w-48" : "w-16";

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "sessions":
        return <MentorSessionRequests/>
      case "ratings":
        return <>ABCS</>
      case "profile":
        return <>ABCS</>
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
              {/* Icon placeholder */}
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

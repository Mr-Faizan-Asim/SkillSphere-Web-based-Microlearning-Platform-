import React from "react";
import { CheckCircle, Shield, Users, Zap, Layers, Settings, Globe } from "lucide-react";

const features = [
  {
    title: "Secure Authentication",
    description: "JWT-based login and registration with encrypted passwords and role-based access.",
    icon: Shield,
  },
  {
    title: "Role-Based Dashboards",
    description: "Different dashboards for Admin, Mentor, and User roles with tailored controls.",
    icon: Layers,
  },
  {
    title: "User Management",
    description: "Admins can view, edit, and delete users with full control over platform activity.",
    icon: Users,
  },
  {
    title: "Mentor Tools",
    description: "Mentors can track learners, assign tasks, and manage training content.",
    icon: Settings,
  },
  {
    title: "Interest & Goals Tracking",
    description: "Store user interests and goals for personalized recommendations.",
    icon: Globe,
  },
  {
    title: "Fast & Responsive UI",
    description: "Built with React and TailwindCSS for a smooth, modern user experience.",
    icon: Zap,
  },
];

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 py-12 px-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Project Features</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the powerful tools and functionalities that make our platform efficient, secure, and user-friendly.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white mb-4 shadow-md">
                <Icon size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          );
        })}
      </div>

      
    </div>
  );
};

export default FeaturesPage;

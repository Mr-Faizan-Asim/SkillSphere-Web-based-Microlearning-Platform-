import React from "react";
import { CheckCircle, DollarSign, GraduationCap, Users } from "lucide-react";

const plans = [
  {
    title: "Student Plan",
    price: "Free",
    description: "Perfect for learners to attend sessions and improve their skills.",
    features: [
      "Unlimited learning sessions",
      "Access to all mentors",
      "Personalized learning dashboard",
      "Track goals and progress",
    ],
    icon: GraduationCap,
    highlight: false,
  },
  {
    title: "Mentor Plan",
    price: "$0 → $1 / session after 20",
    description: "Ideal for mentors to connect, teach, and earn while sharing knowledge.",
    features: [
      "First 20 sessions free",
      "Only $1 per additional session",
      "Full mentor dashboard",
      "Learner performance tracking",
    ],
    icon: Users,
    highlight: true,
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 py-12 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Pricing Plans</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Simple, transparent pricing designed to grow with you. Students always learn for free, and mentors earn more as they teach.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, idx) => {
          const Icon = plan.icon;
          return (
            <div
              key={idx}
              className={`p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 ${
                plan.highlight
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-600"
                  : "bg-white text-gray-800 border-gray-200"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-full mb-6 shadow-md ${
                  plan.highlight ? "bg-white text-indigo-600" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                }`}
              >
                <Icon size={28} />
              </div>

              {/* Title & Price */}
              <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
              <p className="text-lg font-medium mb-4">{plan.price}</p>
              <p
                className={`mb-6 ${
                  plan.highlight ? "text-indigo-100" : "text-gray-600"
                }`}
              >
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, fIdx) => (
                  <li
                    key={fIdx}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle
                      size={20}
                      className={plan.highlight ? "text-white" : "text-indigo-600"}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                className={`w-full py-3 rounded-lg font-medium shadow-md transition-all ${
                  plan.highlight
                    ? "bg-white text-indigo-600 hover:bg-gray-100"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                }`}
              >
                {plan.highlight ? "Become a Mentor" : "Join as Student"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="text-center mt-12 text-sm text-gray-500">
        No hidden fees. Cancel anytime. Sessions are counted per calendar month.
      </div>
    </div>
  );
};

export default PricingPage;

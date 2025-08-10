// src/pages/HowItWorks.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  UserIcon, 
  AcademicCapIcon, 
  CalendarIcon, 
  VideoCameraIcon, 
  ChatAltIcon, 
  ClockIcon, 
  StarIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  BellIcon,
  ChartPieIcon
} from '@heroicons/react/outline';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('learner');

  const learnerSteps = [
    {
      id: 1,
      title: "Sign Up & Profile Setup",
      description: "Create your account and complete your learner profile with your interests, goals, and timezone.",
      icon: UserIcon,
    },
    {
      id: 2,
      title: "Discover Mentors",
      description: "Browse our directory of expert mentors, filter by skills, availability, and ratings.",
      icon: AcademicCapIcon,
    },
    {
      id: 3,
      title: "Book a Session",
      description: "Select an available time slot that works for you. Our system automatically handles timezone conversions.",
      icon: CalendarIcon,
    },
    {
      id: 4,
      title: "Prepare for Session",
      description: "Receive reminders before your session. Access pre-session materials to maximize your learning.",
      icon: ClockIcon,
    },
    {
      id: 5,
      title: "Join the Session",
      description: "Connect with your mentor via video, audio, or chat. Share files and collaborate in real-time.",
      icon: VideoCameraIcon,
    },
    {
      id: 6,
      title: "Provide Feedback",
      description: "After each session, rate your mentor and leave comments to help improve our platform.",
      icon: StarIcon,
    },
    {
      id: 7,
      title: "Review & Progress",
      description: "Access AI-generated session summaries, suggested next steps, and track your learning journey.",
      icon: ChartBarIcon,
    },
  ];

  const mentorSteps = [
    {
      id: 1,
      title: "Apply to Mentor",
      description: "Submit your application with your expertise, qualifications, and teaching experience.",
      icon: ClipboardListIcon,
    },
    {
      id: 2,
      title: "Set Availability",
      description: "Define your teaching schedule and available time slots for sessions.",
      icon: CalendarIcon,
    },
    {
      id: 3,
      title: "Get Approved",
      description: "Our admin team will review your application and approve qualified mentors.",
      icon: CheckCircleIcon,
    },
    {
      id: 4,
      title: "Receive Requests",
      description: "Get notified when learners book sessions with you. Accept or decline requests.",
      icon: BellIcon,
    },
    {
      id: 5,
      title: "Conduct Sessions",
      description: "Connect with learners through our platform. Share resources and knowledge.",
      icon: ChatAltIcon,
    },
    {
      id: 6,
      title: "Share Resources",
      description: "Upload post-session materials, notes, and resources for learners to review.",
      icon: DocumentTextIcon,
    },
    {
      id: 7,
      title: "Track Performance",
      description: "View your ratings, feedback, and analytics to improve your mentoring approach.",
      icon: ChartPieIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              How SkillSphere Works
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-indigo-100">
              Learn how our microlearning platform connects learners with expert mentors for transformative learning experiences
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('learner')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'learner'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  For Learners
                </span>
              </button>
              <button
                onClick={() => setActiveTab('mentor')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'mentor'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  For Mentors
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-12">
          {activeTab === 'learner' ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Journey with SkillSphere</h2>
                
                <div className="space-y-10">
                  {learnerSteps.map((step, index) => (
                    <div key={step.id} className="flex flex-col md:flex-row">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                          <step.icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        {index < learnerSteps.length - 1 && (
                          <div className="hidden md:block h-full w-0.5 bg-gray-200 mx-auto mt-2 mb-2"></div>
                        )}
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-6">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <span className="bg-indigo-100 text-indigo-800 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-3">
                            {step.id}
                          </span>
                          {step.title}
                        </h3>
                        <p className="mt-2 text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 bg-indigo-50 rounded-lg p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <LightningBoltIcon className="h-10 w-10 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-indigo-800">AI-Powered Learning</h3>
                      <p className="mt-2 text-indigo-700">
                        SkillSphere uses artificial intelligence to analyze your learning patterns and provide personalized recommendations for future sessions, topics to explore, and mentors that match your goals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mentoring with SkillSphere</h2>
                
                <div className="space-y-10">
                  {mentorSteps.map((step, index) => (
                    <div key={step.id} className="flex flex-col md:flex-row">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                          <step.icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        {index < mentorSteps.length - 1 && (
                          <div className="hidden md:block h-full w-0.5 bg-gray-200 mx-auto mt-2 mb-2"></div>
                        )}
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-6">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <span className="bg-indigo-100 text-indigo-800 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-3">
                            {step.id}
                          </span>
                          {step.title}
                        </h3>
                        <p className="mt-2 text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 bg-indigo-50 rounded-lg p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <LightningBoltIcon className="h-10 w-10 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-indigo-800">Mentor Support & Tools</h3>
                      <p className="mt-2 text-indigo-700">
                        As a SkillSphere mentor, you'll have access to specialized tools for session planning, progress tracking, and AI-powered insights to help your learners achieve their goals more effectively.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Benefits</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose SkillSphere?
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <ClockIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Microlearning Focus</h3>
              <p className="mt-2 text-gray-600">
                Learn in short, focused sessions that fit your busy schedule. No need to set aside hours for learning.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <AcademicCapIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Expert Mentors</h3>
              <p className="mt-2 text-gray-600">
                Connect with industry professionals who can provide real-world insights and practical knowledge.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Personalized Learning</h3>
              <p className="mt-2 text-gray-600">
                Our AI-powered recommendations ensure you're always learning what's most relevant to your goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to transform your learning?</span>
            <span className="block text-indigo-200">Join SkillSphere today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <a
                href="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Get started
              </a>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="/mentor/apply"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
              >
                Become a Mentor
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Custom Lightning Bolt Icon
const LightningBoltIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

export default HowItWorks;
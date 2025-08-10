// src/components/Features.jsx
import React from 'react';
import { LightningBoltIcon, AcademicCapIcon, DeviceMobileIcon, ChartBarIcon } from '@heroicons/react/outline';

const features = [
  {
    name: 'Micro-Lessons',
    description: 'Short, focused lessons you can complete in under 5 minutes. Perfect for busy schedules and on-the-go learning.',
    icon: LightningBoltIcon,
  },
  {
    name: 'Expert Instructors',
    description: 'Learn from industry professionals and subject matter experts who distill complex topics into digestible insights.',
    icon: AcademicCapIcon,
  },
  {
    name: 'Mobile-First Design',
    description: 'Access courses anytime, anywhere with our mobile-optimized platform. Learn during your commute or coffee breaks.',
    icon: DeviceMobileIcon,
  },
  {
    name: 'Progress Tracking',
    description: 'Visualize your learning journey with personalized dashboards that track your progress and skill development.',
    icon: ChartBarIcon,
  },
];

const Features = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Why SkillSphere</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Transform Your Learning Experience
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our microlearning approach makes skill acquisition faster, more effective, and perfectly suited for the modern learner.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                    <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
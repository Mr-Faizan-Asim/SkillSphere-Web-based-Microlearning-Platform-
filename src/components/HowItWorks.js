// src/components/HowItWorks.jsx
import React from 'react';
import { UserIcon, BookOpenIcon, BadgeCheckIcon, ArrowCircleRightIcon } from '@heroicons/react/outline';

const steps = [
  {
    id: 1,
    name: 'Create Account',
    description: 'Sign up in seconds with your email or social accounts',
    icon: UserIcon,
  },
  {
    id: 2,
    name: 'Choose Courses',
    description: 'Browse our library of micro-courses across various disciplines',
    icon: BookOpenIcon,
  },
  {
    id: 3,
    name: 'Learn in Micro-Moments',
    description: 'Complete bite-sized lessons whenever you have a few minutes',
    icon: ArrowCircleRightIcon,
  },
  {
    id: 4,
    name: 'Earn Certificates',
    description: 'Get recognized for your new skills with shareable certificates',
    icon: BadgeCheckIcon,
  },
];

const HowItWorks = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Process</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            How SkillSphere Works
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Start learning valuable skills in just a few simple steps
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, stepIdx) => (
              <div key={step.name} className="relative">
                {stepIdx !== steps.length - 1 ? (
                  <div className="hidden absolute top-16 right-0 w-10 h-1 bg-indigo-200 sm:block" aria-hidden="true">
                    <svg className="absolute top-0 right-0 -mt-1.5 text-indigo-200" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 7.5a.5.5 0 010 1H5.707l2.147 2.146a.5.5 0 01-.708.708l-3-3a.5.5 0 010-.708l3-3a.5.5 0 11.708.708L5.707 7.5H11.5z" />
                    </svg>
                  </div>
                ) : null}
                <div className="flex flex-col items-center">
                  <div className="bg-white border-2 border-indigo-500 rounded-full w-20 h-20 flex items-center justify-center">
                    <step.icon className="h-10 w-10 text-indigo-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">{step.name}</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Explore Courses
            <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
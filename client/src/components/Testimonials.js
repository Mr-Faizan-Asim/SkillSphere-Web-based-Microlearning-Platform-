// src/components/Testimonials.jsx
import React from 'react';

const testimonials = [
  {
    id: 1,
    quote: "I've completed more courses on SkillSphere in 3 months than I did in 3 years of traditional online learning. The microlearning approach fits perfectly with my busy schedule.",
    attribution: 'Sarah Johnson',
    role: 'Marketing Director',
  },
  {
    id: 2,
    quote: "As a developer, I need to constantly update my skills. SkillSphere's 5-minute lessons let me learn new frameworks during coffee breaks without disrupting my workflow.",
    attribution: 'Michael Chen',
    role: 'Software Engineer',
  },
  {
    id: 3,
    quote: "The bite-sized courses helped me overcome my learning anxiety. Now I actually complete what I start and have earned 7 certificates in just 2 months!",
    attribution: 'Emma Rodriguez',
    role: 'Project Manager',
  },
];

const Testimonials = () => {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            What Our Learners Say
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 p-8 rounded-lg">
                <svg className="text-indigo-400 h-8 w-8 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                <div className="mt-6 flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                  <div className="ml-4">
                    <p className="text-lg font-medium text-gray-900">{testimonial.attribution}</p>
                    <p className="text-indigo-600">{testimonial.role}</p>
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

export default Testimonials;
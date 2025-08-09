// src/components/Pricing.jsx
import React from 'react';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for trying out microlearning',
    features: [
      'Access to 5 beginner courses',
      '3 micro-lessons per day',
      'Basic progress tracking',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro Learner',
    price: '$9',
    period: '/month',
    description: 'For serious skill builders',
    features: [
      'Unlimited course access',
      'Unlimited micro-lessons',
      'Advanced progress analytics',
      'Skill assessments',
      'Downloadable resources',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams and organizations',
    features: [
      'All Pro features',
      'Team management dashboard',
      'Custom learning paths',
      'Progress reporting',
      'SSO integration',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const Pricing = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Choose the plan that works best for your learning journey
          </p>
        </div>

        <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${
                plan.popular ? 'ring-2 ring-indigo-500' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 py-1.5 px-4 bg-indigo-500 rounded-full text-xs font-semibold uppercase tracking-wide text-white transform -translate-y-1/2">
                  Most popular
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.period && (
                    <span className="ml-1 text-xl font-semibold">{plan.period}</span>
                  )}
                </p>
                <p className="mt-2 text-gray-500">{plan.description}</p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <svg className="flex-shrink-0 w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="#"
                className={`mt-8 block w-full py-3 px-6 text-center rounded-md text-white font-medium ${
                  plan.popular 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
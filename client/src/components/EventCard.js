// src/components/EventCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="bg-gray-200 border-2 border-dashed w-full h-48" />
      <div className="p-6">
        <div className="text-sm text-orange-500 font-medium">{formatDate(event.date)}</div>
        <h3 className="mt-2 text-xl font-bold text-gray-900">{event.title}</h3>
        <div className="mt-2 flex items-center text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{event.venue}</span>
        </div>
        <p className="mt-3 text-gray-600 line-clamp-2">{event.description}</p>
        <div className="mt-6">
          <Link 
            to={`/events`} 
            className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
          >
            View details
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
// src/components/mentor/MentorCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const MentorCard = ({ mentor, isOnline, showBookButton }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
      <div className="relative">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
          <div className="ml-3">
            <h3 className="font-semibold text-gray-800">{mentor.name}</h3>
            <p className="text-sm text-gray-600">{mentor.mentorProfile?.expertiseLevel || 'Expert'}</p>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <span className="mr-2">⭐</span>
            <span>{mentor.rating?.average?.toFixed(1) || '4.8'}</span>
            <span className="mx-1">•</span>
            <span>{mentor.mentorProfile?.sessionsCompleted || 120} sessions</span>
          </div>
          <div className="text-xs text-gray-500">
            {isOnline ? 'Online now' : 'Last online 2h ago'}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {mentor.mentorProfile?.subjects?.slice(0, 3).map((subject, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
            >
              {subject}
            </span>
          ))}
        </div>
        
        {showBookButton && (
          <div className="mt-2">
            <Link 
              to={`/book-session?mentor=${mentor._id}`}
              className="block w-full text-center py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
            >
              Book Session
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorCard;
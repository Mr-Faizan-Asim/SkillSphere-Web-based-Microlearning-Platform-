// src/pages/EventsPage.js
import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import EventCard from '../components/EventCard';

const EventsPage = () => {
  // Sample data for events
  const upcomingEvents = [
    {
      id: 1,
      title: "Annual Alumni Meet 2025",
      date: "2025-10-15",
      venue: "UET Main Campus, Lahore",
      description: "Join us for the biggest alumni gathering of the year with networking, campus tours, and cultural performances.",
    },
    {
      id: 2,
      title: "Tech Innovation Summit",
      date: "2025-09-20",
      venue: "Virtual Event",
      description: "Explore cutting-edge technologies and innovations with industry leaders and fellow alumni.",
    },
    {
      id: 3,
      title: "Career Fair for Graduates",
      date: "2025-11-05",
      venue: "UET Expo Center",
      description: "Connect with top employers and explore career opportunities in engineering and technology.",
    },
    {
      id: 4,
      title: "Alumni Golf Tournament",
      date: "2025-11-20",
      venue: "Defence Raya Golf Club",
      description: "Annual golf tournament for alumni with networking opportunities and prizes.",
    }
  ];
  
  const pastEvents = [
    {
      id: 1,
      title: "UET Tech Expo 2024",
      date: "2024-05-10",
      venue: "UET Expo Center",
      description: "Showcasing student projects and innovations with industry collaborations.",
      photos: 24,
      outcomes: "35+ companies participated, 15 MoUs signed"
    },
    {
      id: 2,
      title: "Alumni Homecoming 2024",
      date: "2024-03-15",
      venue: "UET Main Campus",
      description: "Reunion event for alumni batches celebrating milestone anniversaries.",
      photos: 48,
      outcomes: "500+ alumni attended, $20k raised for scholarships"
    },
    {
      id: 3,
      title: "Women in Engineering Conference",
      date: "2024-02-08",
      venue: "UET Auditorium",
      description: "Empowering women engineers through workshops and networking sessions.",
      photos: 32,
      outcomes: "15 mentorship connections established"
    }
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">UET Alumni Events</h1>
        <p className="mt-2 text-gray-600">Discover upcoming gatherings and relive past moments with the UET community</p>
        
        <Tabs className="mt-10">
          <TabList className="flex border-b">
            <Tab className="mr-4 py-3 px-4 cursor-pointer font-medium text-gray-600 hover:text-gray-900 aria-selected:text-orange-500 aria-selected:border-b-2 aria-selected:border-orange-500">Upcoming Events</Tab>
            <Tab className="py-3 px-4 cursor-pointer font-medium text-gray-600 hover:text-gray-900 aria-selected:text-orange-500 aria-selected:border-b-2 aria-selected:border-orange-500">Past Events</Tab>
          </TabList>
          
          <TabPanel>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map(event => (
                <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gray-200 border-2 border-dashed w-full h-48" />
                  <div className="p-6">
                    <div className="text-sm text-gray-500">{event.date}</div>
                    <h3 className="mt-2 text-xl font-bold text-gray-900">{event.title}</h3>
                    <div className="mt-2 flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{event.venue}</span>
                    </div>
                    <p className="mt-3 text-gray-600">{event.description}</p>
                    
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      <span>{event.photos} photos</span>
                    </div>
                    
                    <div className="mt-2 flex items-start text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>Outcomes: {event.outcomes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default EventsPage;
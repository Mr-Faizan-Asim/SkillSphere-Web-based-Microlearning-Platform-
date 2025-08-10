// src/Pages/SessionDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, isBefore, isAfter, isPast } from "date-fns";
import {
  MdCalendarToday,
  MdList,
  MdPendingActions,
  MdHistory,
  MdRefresh,
  MdStar,
  MdStarOutline,
  MdCheckCircle
} from "react-icons/md";

const sidebarItems = [
  { id: "all", label: "All Sessions", icon: <MdList size={24} /> },
  { id: "upcoming", label: "Upcoming", icon: <MdCalendarToday size={24} /> },
  { id: "previous", label: "Previous", icon: <MdHistory size={24} /> },
  { id: "rated", label: "Rated Sessions", icon: <MdStar size={24} /> },
];

export default function SessionDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isRating, setIsRating] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const u = sessionStorage.getItem("user") || localStorage.getItem("user");
    const t = sessionStorage.getItem("token") || localStorage.getItem("token");
    setUser(u ? JSON.parse(u) : null);
    setToken(t || null);
  }, []);

  useEffect(() => {
    if (user) fetchSessions();
  }, [user, activeTab]);

  async function fetchSessions() {
    setLoading(true);
    setError("");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint =
        user.role === "mentor"
          ? `sessions/mentor/${user.id || user._id}`
          : `sessions/learner/${user.id || user._id}`;
      const res = await axios.get(`http://localhost:4000/${endpoint}`, { headers });
      const merged = mergePastUpcoming(res.data.past, res.data.upcoming);
      setSessions(filterByTab(merged, activeTab));
    } catch (err) {
      setError("Failed to load sessions. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function mergePastUpcoming(past = [], upcoming = []) {
    return [...upcoming, ...past].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  }

  function filterByTab(list = [], tab) {
    const now = new Date();
    if (tab === "upcoming") return list.filter(s => new Date(s.scheduledAt) >= now);
    if (tab === "previous") return list.filter(s => new Date(s.scheduledAt) < now);
    if (tab === "rated") return list.filter(s => s.isRated);
    return list;
  }

  function formatDatePretty(d) {
    try { return format(typeof d === "string" ? parseISO(d) : d, "PPpp"); }
    catch { return String(d); }
  }

  // Reset rating form when session changes
  useEffect(() => {
    if (selectedSession) {
      setRating(selectedSession.rating || 0);
      setReview(selectedSession.review || '');
      setIsRating(false);
      setRatingError('');
      setIsCompleting(false);
    }
  }, [selectedSession]);

  const handleRateMentor = async () => {
    if (rating === 0) {
      setRatingError('Please select a rating');
      return;
    }
    
    try {
      setIsRating(true);
      setRatingError('');
      console.log('Submitting rating:', rating, review, selectedSession._id);

      const res = await axios.patch(
        `http://localhost:4000/sessions/${selectedSession._id}/rate`,
        { rating, review },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update session in state
      const updatedSession = {
        ...selectedSession,
        rating,
        review,
        isRated: true
      };
      
      setSelectedSession(updatedSession);
      setSessions(prev => prev.map(s => 
        s._id === selectedSession._id ? updatedSession : s
      ));
      
      // Show success message
      alert('Thank you for your rating! Your feedback helps improve our platform.');
    } catch (err) {
      console.error('Rating failed', err);
      const errorMsg = err.response?.data?.error || 'Failed to submit rating';
      setRatingError(errorMsg);
      
      // Special handling for session not completed
      if (errorMsg.includes('completed')) {
        alert('This session must be marked as completed before rating. Please contact support if you believe this is an error.');
      }
    } finally {
      setIsRating(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    try {
      setIsCompleting(true);
      
      const res = await axios.patch(
        `http://localhost:4000/sessions/${selectedSession._id}/mark-completed`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update session in state
      const updatedSession = {
        ...selectedSession,
        status: 'completed'
      };
      
      setSelectedSession(updatedSession);
      setSessions(prev => prev.map(s => 
        s._id === selectedSession._id ? updatedSession : s
      ));
      
      alert('Session marked as completed! You can now rate your mentor.');
    } catch (err) {
      console.error('Marking as completed failed', err);
      const errorMsg = err.response?.data?.error || 'Failed to mark session as completed';
      alert(errorMsg);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-white shadow-lg flex flex-col">
        <div className="flex items-center justify-center h-16 text-indigo-600 text-xl font-bold">
          Sessions
        </div>
        <nav className="flex-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedSession(null); }}
              className={`w-full flex items-center p-4 space-x-3 hover:bg-indigo-100 transition ${
                activeTab === item.id ? "bg-indigo-200" : ""
              }`}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          onClick={fetchSessions}
          className="m-4 p-2 bg-indigo-600 text-white rounded-full mx-auto hover:bg-indigo-700"
          title="Refresh"
        >
          <MdRefresh size={24} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {sidebarItems.find(f => f.id === activeTab)?.label}
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sessions.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl shadow">
                <MdHistory className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {activeTab === 'upcoming' ? 'No upcoming sessions' : 
                   activeTab === 'previous' ? 'No previous sessions' : 
                   activeTab === 'rated' ? 'No rated sessions' : 'No sessions'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'upcoming' ? 'You don\'t have any upcoming sessions scheduled.' : 
                   activeTab === 'previous' ? 'You don\'t have any previous sessions.' : 
                   activeTab === 'rated' ? 'You haven\'t rated any mentors yet.' : 'Get started by booking a session!'}
                </p>
              </div>
            ) : (
              sessions.map(s => (
                <div
                  key={s._id}
                  onClick={() => setSelectedSession(s)}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer transition relative"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">
                      {user.role === 'mentor' ? 
                        s.learnerId?.name || s.learnerId?.email : 
                        s.mentorId?.name || s.mentorId?.email}
                    </h3>
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        isBefore(new Date(s.scheduledAt), new Date())
                          ? "bg-gray-200 text-gray-600"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {isBefore(new Date(s.scheduledAt), new Date()) ? "Past" : "Upcoming"}
                    </span>
                  </div>
                  <p className="text-gray-600">{formatDatePretty(s.scheduledAt)}</p>
                  <p className="text-gray-600">Duration: {s.durationMinutes} min</p>
                  <p className="capitalize">
                    <strong>Status:</strong> {s.status}
                  </p>

                  {/* Show meeting link if confirmed and link exists */}
                  {s.status === "confirmed" && s.meetingLink && (
                    <p className="mt-2">
                      <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline font-semibold"
                        onClick={e => e.stopPropagation()}
                      >
                        Join Meeting
                      </a>
                    </p>
                  )}

                  {/* Rating indicator for rated sessions */}
                  {s.isRated && (
                    <div className="mt-2 flex items-center pt-2 border-t">
                      <div className="flex text-yellow-400 text-sm">
                        {'★'.repeat(s.rating)}
                        {'☆'.repeat(5 - s.rating)}
                      </div>
                      <span className="ml-1 text-gray-500 text-sm">{s.rating}/5</span>
                    </div>
                  )}

                  {/* Rate Mentor badge for eligible sessions */}
                  {isBefore(new Date(s.scheduledAt), new Date()) && 
                   s.status === 'completed' && 
                   !s.isRated && (
                    <span className="mt-2 inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                      Rate Mentor
                    </span>
                  )}

                  {/* Mark as Completed button for eligible sessions */}
                  {user.role === 'learner' && 
                   isBefore(new Date(s.scheduledAt), new Date()) && 
                   s.status === 'confirmed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSession(s);
                        setTimeout(() => {
                          const button = document.getElementById('mark-completed-button');
                          if (button) button.focus();
                        }, 100);
                      }}
                      className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Detail Panel */}
        {selectedSession && (
          <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-white shadow-lg overflow-y-auto p-6">
            <button
              onClick={() => setSelectedSession(null)}
              className="mb-4 text-indigo-600 flex items-center"
            >
              ← Back to sessions
            </button>
            <h3 className="text-xl font-bold mb-2">Session Details</h3>
            <p className="text-gray-600 mb-4">
              {formatDatePretty(selectedSession.scheduledAt)}
            </p>
            <div className="space-y-3">
              <div>
                <strong>{user.role === 'mentor' ? 'Learner:' : 'Mentor:'}</strong> 
                {user.role === 'mentor' ? 
                  selectedSession.learnerId?.name || selectedSession.learnerId?.email : 
                  selectedSession.mentorId?.name || selectedSession.mentorId?.email}
              </div>
              <div><strong>Duration:</strong> {selectedSession.durationMinutes} minutes</div>
              <div><strong>Channel:</strong> {selectedSession.channel}</div>
              <div><strong>Status:</strong> {selectedSession.status}</div>
              
              {/* Show meeting link if confirmed and link exists */}
              {selectedSession.status === "confirmed" && selectedSession.meetingLink && (
                <div className="mt-2">
                  <strong>Meeting Link:</strong>
                  <a
                    href={selectedSession.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-indigo-600 hover:underline font-semibold mt-1"
                    onClick={e => e.stopPropagation()}
                  >
                    {selectedSession.meetingLink}
                  </a>
                </div>
              )}
            </div>

            {/* Mark as Completed Button - Only for past confirmed sessions */}
            {user.role === 'learner' && 
             isBefore(new Date(selectedSession.scheduledAt), new Date()) && 
             selectedSession.status === 'confirmed' && (
              <div className="mt-4">
                <button
                  id="mark-completed-button"
                  onClick={handleMarkAsCompleted}
                  disabled={isCompleting}
                  className={`w-full py-2 px-4 rounded-md font-medium flex items-center justify-center ${
                    isCompleting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isCompleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Marking as Completed...
                    </>
                  ) : (
                    <>
                      <MdCheckCircle className="mr-2" />
                      Mark Session as Completed
                    </>
                  )}
                </button>
                <p className="text-gray-500 text-sm mt-2 text-center">
                  Click this when your session has finished to mark it as completed
                </p>
              </div>
            )}

            {/* Rating Section - Only for past completed sessions */}
            {user.role === 'learner' && 
             isBefore(new Date(selectedSession.scheduledAt), new Date()) && 
             selectedSession.status === 'completed' && 
             !selectedSession.isRated && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-bold text-lg mb-3">Rate this Session</h4>
                
                <div className="flex space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-colors focus:outline-none ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      aria-label={`Rate ${star} stars`}
                    >
                      {star <= rating ? <MdStar /> : <MdStarOutline />}
                    </button>
                  ))}
                </div>
                
                {ratingError && (
                  <p className="text-red-500 text-sm mb-2">{ratingError}</p>
                )}
                
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience (optional)"
                  className="w-full p-3 border rounded-md mb-4 min-h-[100px] focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={500}
                  aria-label="Review"
                />
                
                <button
                  onClick={handleRateMentor}
                  disabled={isRating}
                  className={`w-full py-2 px-4 rounded-md font-medium ${
                    isRating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isRating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Rating'}
                </button>
              </div>
            )}

            {/* Show existing rating if already rated */}
            {selectedSession.isRated && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-bold text-lg mb-2">Your Rating</h4>
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400 text-xl">
                    {'★'.repeat(selectedSession.rating)}
                    {'☆'.repeat(5 - selectedSession.rating)}
                  </div>
                  <span className="ml-2 font-medium">{selectedSession.rating}/5</span>
                </div>
                {selectedSession.review && (
                  <blockquote className="italic border-l-4 border-indigo-200 pl-4 py-2 bg-gray-50 rounded">
                    "{selectedSession.review}"
                  </blockquote>
                )}
              </div>
            )}

            {/* Session notes and resources */}
            {(selectedSession.notes || (selectedSession.resources && selectedSession.resources.length > 0)) && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-bold text-lg mb-3">Session Materials</h4>
                
                {selectedSession.notes && (
                  <div className="mb-4">
                    <h5 className="font-medium mb-2">Notes:</h5>
                    <p className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{selectedSession.notes}</p>
                  </div>
                )}
                
                {selectedSession.resources && selectedSession.resources.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Resources:</h5>
                    <ul className="space-y-2">
                      {selectedSession.resources.map((resource, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-indigo-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                          </svg>
                          <div>
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline font-medium"
                              onClick={e => e.stopPropagation()}
                            >
                              {resource.title || `Resource ${index + 1}`}
                            </a>
                            {resource.description && (
                              <p className="text-gray-600 text-sm mt-1">{resource.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
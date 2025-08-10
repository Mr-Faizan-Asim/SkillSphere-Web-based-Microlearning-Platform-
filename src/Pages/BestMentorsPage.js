// src/Pages/BestMentorsPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaStar, FaRobot, FaMagic, FaThumbsUp } from "react-icons/fa";
import { MdRefresh, MdPerson, MdLightbulb } from "react-icons/md";
import SessionBookingForm from "./SessionBookingForm";
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from "recharts";

const GROQ_API_KEY = "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";

const sidebarItems = [
  { id: "best-rated", label: "Best Rated", icon: <FaStar /> },
  { id: "ai-suggestions", label: "AI Suggestions", icon: <FaRobot /> },
  { id: "my-preferences", label: "My Preferences", icon: <MdLightbulb /> },
];

const ratingOptions = [
  { value: 0, label: "All Ratings" },
  { value: 1, label: "1+ Stars" },
  { value: 2, label: "2+ Stars" },
  { value: 3, label: "3+ Stars" },
  { value: 4, label: "4+ Stars" },
  { value: 5, label: "5 Stars Only" },
];

export default function BestMentorsPage() {
  const [activeTab, setActiveTab] = useState("best-rated");
  const [mentors, setMentors] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [userPreferences, setUserPreferences] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  async function fetchMentors() {
    try {
      const res = await axios.get("http://localhost:4000/mentors/best-rated");
      const mentorsData = res.data.data || [];
      setMentors(mentorsData);
      setAllMentors(mentorsData);
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setError("Failed to load mentors. Please try again.");
    }
  }

  async function fetchMentorDetails(id) {
    try {
      const res = await axios.get(`http://localhost:4000/mentors/${id}`);
      setSelectedMentor(res.data);
      setAiSummary(null);
      setShowSummary(false);
    } catch (err) {
      console.error("Error fetching mentor details:", err);
      setError("Failed to load mentor details. Please try again.");
    }
  }

  const filteredMentors = mentors.filter((mentor) => {
    const rating = mentor.mentorProfile?.rating || 0;
    if (rating < minRating) return false;

    const search = searchTerm.toLowerCase();
    if (!search) return true;

    const name = (mentor.name || "").toLowerCase();
    const email = (mentor.email || "").toLowerCase();
    const subjects = (mentor.mentorProfile?.subjects || []).join(" ").toLowerCase();
    const bio = (mentor.mentorProfile?.bio || "").toLowerCase();
    const tags = (mentor.mentorProfile?.tags || []).join(" ").toLowerCase();

    return (
      name.includes(search) || 
      email.includes(search) || 
      subjects.includes(search) || 
      bio.includes(search) || 
      tags.includes(search)
    );
  });

  // AI Summarization Functions
  const generateAiSummary = async (mentor) => {
    if (!mentor) return;
    
    setGeneratingSummary(true);
    setError("");
    
    try {
      const profileText = `
        Mentor Name: ${mentor.name}
        Rating: ${mentor.mentorProfile?.rating || 'Not rated'}
        Subjects: ${mentor.mentorProfile?.subjects?.join(', ') || 'N/A'}
        Bio: ${mentor.mentorProfile?.bio || 'No bio provided'}
        Tags: ${mentor.mentorProfile?.tags?.join(', ') || 'N/A'}
        Hourly Rate: ${mentor.mentorProfile?.hourlyRate || 'Not specified'}
        Languages: ${mentor.mentorProfile?.languages?.join(', ') || 'N/A'}
        Certifications: ${mentor.mentorProfile?.certifications?.join(', ') || 'N/A'}
      `;
      
      const prompt = `You are an AI assistant that summarizes mentor profiles for learners. 
      Create a concise, engaging 3-4 sentence summary of this mentor profile that highlights their 
      expertise, teaching style, and why they'd be a great fit for learners. 
      Use an encouraging and professional tone. Don't mention the rating directly but imply quality:
      
      ${profileText}
      
      Mentor Profile Summary:`;
      
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          messages: [
            {
              role: "system",
              content: "You are a helpful mentor matching assistant that creates engaging summaries of mentor profiles."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.7,
          max_tokens: 250
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      const summary = response.data.choices[0].message.content.trim();
      setAiSummary(summary);
      setShowSummary(true);
    } catch (err) {
      console.error("AI summary generation failed:", err);
      setError("Failed to generate AI summary. Please try again.");
      setAiSummary("Unable to generate summary at this time. Please try again later.");
      setShowSummary(true);
    } finally {
      setGeneratingSummary(false);
    }
  };

  // AI Suggestions Functions
  const generateAiSuggestions = async () => {
    if (!userPreferences.trim()) {
      setError("Please enter your learning goals and preferences first.");
      return;
    }
    
    setGeneratingSuggestions(true);
    setError("");
    setAiSuggestions([]);
    
    try {
      const mentorsText = allMentors.map(mentor => `
        Mentor ID: ${mentor._id}
        Name: ${mentor.name}
        Rating: ${mentor.mentorProfile?.rating || 'Not rated'}
        Subjects: ${mentor.mentorProfile?.subjects?.join(', ') || 'N/A'}
        Bio: ${mentor.mentorProfile?.bio || 'No bio provided'}
        Tags: ${mentor.mentorProfile?.tags?.join(', ') || 'N/A'}
        Hourly Rate: ${mentor.mentorProfile?.hourlyRate || 'Not specified'}
        Languages: ${mentor.mentorProfile?.languages?.join(', ') || 'N/A'}
      `).join('\n\n');
      
      const prompt = `You are an AI mentor matching assistant. Analyze the following list of mentors 
      and recommend the top 3 mentors that best match the learner's preferences. For each recommended 
      mentor, provide:
      1. Why they're a good match (2-3 sentences)
      2. What the learner would gain from working with them
      3. A suggestion for how to approach learning with this mentor
      
      Learner's Preferences:
      "${userPreferences}"
      
      Available Mentors:
      ${mentorsText}
      
      Format your response as JSON with a "suggestions" array containing objects with 
      "mentorId", "reason", "benefits", and "approach" fields. Do not include any other text.`;
      
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          messages: [
            {
              role: "system",
              content: "You are a mentor matching expert that provides personalized recommendations in strict JSON format."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.3,
          response_format: { type: "json_object" },
          max_tokens: 1000
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      let suggestionsData;
      try {
        // Try to parse the response as JSON
        suggestionsData = JSON.parse(response.data.choices[0].message.content);
      } catch (e) {
        // If parsing fails, try to extract JSON from the response
        const jsonMatch = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestionsData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid response format from AI");
        }
      }
      
      // Map the AI suggestions to include mentor details
      const enrichedSuggestions = (suggestionsData.suggestions || []).map(suggestion => {
        const mentor = allMentors.find(m => m._id === suggestion.mentorId);
        return {
          ...suggestion,
          mentor
        };
      });
      
      setAiSuggestions(enrichedSuggestions);
    } catch (err) {
      console.error("AI suggestions generation failed:", err);
      setError("Failed to generate AI suggestions. Please try again.");
      setAiSuggestions([]);
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const Sidebar = () => (
    <nav className="w-64 bg-gray-100 min-h-screen p-4 border-r border-gray-200">
      <div className="flex items-center mb-6">
        <FaStar className="text-yellow-400 text-2xl mr-2" />
        <h2 className="text-xl font-bold">Mentor Recommendations</h2>
      </div>
      <ul className="space-y-1">
        {sidebarItems.map((item) => (
          <li
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (item.id === "ai-suggestions" && !aiSuggestions.length && userPreferences) {
                generateAiSuggestions();
              }
            }}
            className={`cursor-pointer p-3 rounded-lg flex items-center space-x-3 transition-all ${
              activeTab === item.id 
                ? "bg-indigo-600 text-white shadow-md" 
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      
      <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <h3 className="font-semibold text-indigo-800 mb-2 flex items-center">
          <MdPerson className="mr-2" /> Your Profile
        </h3>
        <p className="text-sm text-gray-600">
          We use your learning goals and preferences to provide personalized mentor recommendations.
        </p>
        <button
          onClick={() => setActiveTab("my-preferences")}
          className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 px-3 rounded-md transition"
        >
          Update Preferences
        </button>
      </div>
    </nav>
  );

  const Filters = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-6 gap-3">
      <div className="relative flex-grow">
        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search by name, subject, or expertise..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search mentors"
        />
      </div>

      <select
        className="border border-gray-300 rounded-xl px-4 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        value={minRating}
        onChange={(e) => setMinRating(Number(e.target.value))}
        aria-label="Filter mentors by minimum rating"
      >
        {ratingOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );

  const scrollStyle = "max-h-[70vh] overflow-y-auto";

  const BestRatedTab = () => (
    <div className="p-6 overflow-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h3 className="text-3xl font-bold mb-2 text-gray-800">Top Rated Mentors</h3>
          <p className="text-gray-600">Discover our highest-rated mentors based on learner feedback</p>
        </div>
        <button
          onClick={fetchMentors}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <MdRefresh className="mr-2" /> Refresh Mentors
        </button>
      </div>
      
      <Filters />
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {filteredMentors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <FaStar className="text-indigo-600 text-3xl" />
            </div>
          </div>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">No mentors found</h4>
          <p className="text-gray-600 max-w-md mx-auto">
            We couldn't find any mentors matching your criteria. Try adjusting your search or rating filters.
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 ${scrollStyle}`}>
          {filteredMentors.map((mentor) => (
            <div
              key={mentor._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-2xl font-bold text-gray-800">{mentor.name}</h4>
                      <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                        <FaStar className="mr-1" />
                        {mentor.mentorProfile?.rating?.toFixed(1) || "N/A"}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-1 mb-3">
                      {mentor.mentorProfile?.subjects?.join(", ") || "Expert in various fields"}
                    </p>
                    
                    <p className="text-gray-700 line-clamp-2">
                      {mentor.mentorProfile?.bio || "This mentor has not provided a bio yet."}
                    </p>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mentor.mentorProfile?.tags?.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end space-y-3">
                    <button
                      onClick={() => fetchMentorDetails(mentor._id)}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition w-full md:w-auto"
                    >
                      View Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        fetchMentorDetails(mentor._id);
                        setTimeout(() => generateAiSummary(mentor), 300);
                      }}
                      disabled={generatingSummary && selectedMentor?._id === mentor._id}
                      className={`flex items-center px-4 py-2 rounded-xl transition w-full md:w-auto ${
                        generatingSummary && selectedMentor?._id === mentor._id
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {generatingSummary && selectedMentor?._id === mentor._id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FaMagic className="mr-2" /> AI Summary
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {showSummary && selectedMentor?._id === mentor._id && aiSummary && (
                  <div className="mt-5 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <div className="flex items-center mb-2">
                      <FaRobot className="text-indigo-600 mr-2" />
                      <h5 className="font-semibold text-indigo-800">AI-Powered Profile Summary</h5>
                    </div>
                    <p className="text-gray-700 italic">{aiSummary}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const AiSuggestionsTab = () => (
    <div className="p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <FaRobot className="text-indigo-600 text-3xl" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">Personalized Mentor Recommendations</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI analyzes your learning preferences and matches you with the perfect mentors
          </p>
        </div>
        
        {userPreferences ? (
          <>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 mb-8">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-800">Your Learning Preferences</h4>
                <button
                  onClick={() => setActiveTab("my-preferences")}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Edit
                </button>
              </div>
              <p className="text-gray-700 italic bg-gray-50 p-3 rounded-lg">
                "{userPreferences}"
              </p>
            </div>
            
            <button
              onClick={generateAiSuggestions}
              disabled={generatingSuggestions}
              className={`w-full mb-8 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition ${
                generatingSuggestions ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {generatingSuggestions ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Your Preferences...
                </>
              ) : (
                <>
                  <FaMagic className="mr-2" /> Refresh Recommendations
                </>
              )}
            </button>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {aiSuggestions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <div className="flex justify-center mb-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <FaThumbsUp className="text-indigo-600 text-3xl" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">No suggestions yet</h4>
                <p className="text-gray-600 max-w-md mx-auto">
                  Click the button above to generate personalized mentor recommendations based on your preferences.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {aiSuggestions.map((suggestion, index) => (
                  suggestion.mentor && (
                    <div 
                      key={suggestion.mentorId} 
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
                    >
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="bg-indigo-100 text-indigo-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            {index + 1}
                          </div>
                          <h4 className="text-xl font-bold text-gray-800">{suggestion.mentor.name}</h4>
                          <div className="ml-auto flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                            <FaStar className="mr-1" />
                            {suggestion.mentor.mentorProfile?.rating?.toFixed(1) || "N/A"}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="md:col-span-2">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                              <h5 className="font-semibold text-indigo-800 mb-2 flex items-center">
                                <FaMagic className="mr-2" /> Why They're a Good Match
                              </h5>
                              <p className="text-gray-700">{suggestion.reason}</p>
                            </div>
                            
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                              <h5 className="font-semibold text-green-800 mb-2">What You'll Gain</h5>
                              <p className="text-gray-700">{suggestion.benefits}</p>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                              <h5 className="font-semibold text-blue-800 mb-2">Learning Approach</h5>
                              <p className="text-gray-700">{suggestion.approach}</p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <h5 className="font-semibold text-gray-800 mb-3">Mentor Details</h5>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">Subjects</p>
                                <p className="font-medium">
                                  {suggestion.mentor.mentorProfile?.subjects?.join(", ") || "Various"}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500">Hourly Rate</p>
                                <p className="font-medium">
                                  ${suggestion.mentor.mentorProfile?.hourlyRate || "Custom"}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500">Languages</p>
                                <p className="font-medium">
                                  {suggestion.mentor.mentorProfile?.languages?.join(", ") || "English"}
                                </p>
                              </div>
                              
                              <div className="mt-4">
                                <button
                                  onClick={() => fetchMentorDetails(suggestion.mentorId)}
                                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                                >
                                  View Full Profile
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <MdLightbulb className="text-indigo-600 text-3xl" />
              </div>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Tell Us About Your Learning Goals</h4>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              To provide personalized mentor recommendations, please share your learning goals, 
              preferred subjects, and what you're looking to achieve.
            </p>
            <button
              onClick={() => setActiveTab("my-preferences")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition"
            >
              Set Up My Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const MyPreferencesTab = () => (
    <div className="p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <MdLightbulb className="text-indigo-600 text-3xl" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">Your Learning Preferences</h3>
          <p className="text-gray-600">
            Help us match you with the perfect mentors by sharing your learning goals and preferences
          </p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">What are your learning goals?</h4>
          
          <textarea
            value={userPreferences}
            onChange={(e) => setUserPreferences(e.target.value)}
            placeholder="Example: I want to learn React.js to build web applications. I'm a beginner with some HTML/CSS knowledge. I prefer hands-on learning with projects and need help 2 times per week for 1 hour sessions."
            className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition mb-6"
            aria-label="Describe your learning preferences"
          />
          
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => {
                setUserPreferences("");
              }}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Clear
            </button>
            <button
              onClick={() => {
                if (userPreferences.trim()) {
                  if (activeTab === "ai-suggestions") {
                    generateAiSuggestions();
                  } else {
                    setActiveTab("ai-suggestions");
                  }
                } else {
                  setError("Please enter your learning preferences first.");
                }
              }}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              Save & Get Recommendations
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Tips for Effective Preferences</h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2 text-indigo-600">•</span>
              Be specific about what you want to learn (e.g., "React.js for frontend development")
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-indigo-600">•</span>
              Mention your current skill level (beginner, intermediate, advanced)
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-indigo-600">•</span>
              Include your learning style preferences (theory, hands-on, project-based)
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-indigo-600">•</span>
              Note any specific goals or timelines (e.g., "prepare for job interview in 3 months")
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const MentorDetailsTab = () => {
    if (!selectedMentor) return <p className="p-6">Loading mentor details...</p>;

    const m = selectedMentor;

    const subjectData = (m.mentorProfile?.subjects || []).map((sub, idx) => ({
      name: sub,
      value: Math.floor(Math.random() * 100) + 50,
      fill: `hsl(${idx * 60}, 70%, 50%)`,
    }));

    return (
      <div className="p-6 overflow-auto max-h-[85vh]">
        <button
          className="mb-4 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition"
          onClick={() => setActiveTab("best-rated")}
        >
          ← Back to Mentors
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-6 mb-6">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name || m.email}`}
                  alt="Mentor avatar"
                  className="w-24 h-24 rounded-full border-4 border-indigo-500"
                />
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{m.name}</h2>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full">
                      <FaStar className="mr-1" />
                      {m.mentorProfile?.rating?.toFixed(1) || "N/A"}
                    </div>
                    <span className="ml-3 text-gray-600">
                      {m.mentorProfile?.ratingCount || 0} {m.mentorProfile?.ratingCount === 1 ? "rating" : "ratings"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-xl font-bold text-gray-800 mb-3">About</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {m.mentorProfile?.bio || "This mentor has not provided a bio yet."}
                </p>
                
                {showSummary && aiSummary && (
                  <div className="mt-6 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <div className="flex items-center mb-3">
                      <FaRobot className="text-indigo-600 mr-2 text-xl" />
                      <h4 className="text-xl font-bold text-indigo-800">AI-Powered Profile Summary</h4>
                    </div>
                    <p className="text-gray-700 italic text-lg leading-relaxed">{aiSummary}</p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                    <span className="bg-indigo-100 p-2 rounded-md mr-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </span>
                    Expertise
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500 text-sm">Subjects</p>
                      <p className="font-medium">
                        {m.mentorProfile?.subjects?.join(", ") || "Various fields"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Hourly Rate</p>
                      <p className="font-medium">
                        ${m.mentorProfile?.hourlyRate || "Custom"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Languages</p>
                      <p className="font-medium">
                        {m.mentorProfile?.languages?.join(", ") || "English"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                    <span className="bg-indigo-100 p-2 rounded-md mr-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                      </svg>
                    </span>
                    Additional Info
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500 text-sm">Timezone</p>
                      <p className="font-medium">
                        {m.mentorProfile?.timezone || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Certifications</p>
                      <p className="font-medium">
                        {m.mentorProfile?.certifications?.join(", ") || "None listed"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Availability</p>
                      <p className="font-medium">Regular schedule</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                  <span className="bg-indigo-100 p-2 rounded-md mr-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </span>
                  Subject Proficiency
                </h3>
                {subjectData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={15} data={subjectData}>
                        <RadialBar
                          minAngle={15}
                          label={{ position: "insideStart", fill: "#fff" }}
                          background
                          clockWise
                          dataKey="value"
                        />
                        <Legend 
                          iconSize={10} 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center" 
                          wrapperStyle={{ paddingTop: 10 }}
                        />
                        <Tooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No subject proficiency data available</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                  <span className="bg-indigo-100 p-2 rounded-md mr-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 6h5M7 10h3m-3 4h9m-9 4H6a2 2 0 01-2-2v-5a2 2 0 012-2h9a2 2 0 012 2v5a2 2 0 01-2 2h-4m-5-4v5"></path>
                    </svg>
                  </span>
                  Portfolio
                </h3>
                <ul className="list-disc list-inside space-y-2 max-w-xl">
                  {m.mentorProfile?.portfolio?.length ? (
                    m.mentorProfile.portfolio.map((item, i) => (
                      <li key={i} className="break-words">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline hover:text-indigo-800 transition break-all"
                        >
                          {item.title || `Portfolio Item ${i + 1}`}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">No portfolio items</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Ready to Learn?</h3>
              
              <button
                className="w-full mb-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition"
                onClick={() => setActiveTab("session-form")}
              >
                Schedule a Session
              </button>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Mentor Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium">Within 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sessions Completed</span>
                    <span className="font-medium">{m.sessionsCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">
                      {m.createdAt ? new Date(m.createdAt).getFullYear() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {m.mentorProfile?.tags?.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SessionFormTab = () => (
    <div className="p-6">
      <h3 className="text-3xl font-bold mb-6">Schedule a Session</h3>
      {selectedMentor ? (
        <SessionBookingForm 
          mentor={selectedMentor} 
          onBack={() => setActiveTab("mentor-details")} 
        />
      ) : (
        <p className="text-gray-600">Loading session form...</p>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "best-rated":
        return <BestRatedTab />;
      case "ai-suggestions":
        return <AiSuggestionsTab />;
      case "my-preferences":
        return <MyPreferencesTab />;
      case "mentor-details":
        return <MentorDetailsTab />;
      case "session-form":
        return <SessionFormTab />;
      default:
        return <BestRatedTab />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-grow bg-gray-50">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
}
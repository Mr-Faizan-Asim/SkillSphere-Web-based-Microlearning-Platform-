// src/Pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from "recharts";
import { 
  FaUsers, 
  FaChalkboardTeacher, 
  FaCalendarAlt, 
  FaStar, 
  FaCheckCircle, 
  FaClock, 
  FaSearch, 
  FaFilter, 
  FaChartLine,
  FaExclamationTriangle,
  FaUserPlus,
  FaCogs,
  FaThumbsUp,
  FaSpinner
} from "react-icons/fa";
import { MdRefresh, MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import { format, parseISO, isBefore, isAfter, subDays, startOfDay, endOfDay } from "date-fns";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: <FaChartLine /> },
  { id: "users", label: "User Management", icon: <FaUsers /> },
  { id: "mentors", label: "Mentor Management", icon: <FaChalkboardTeacher /> },
  { id: "sessions", label: "Session Management", icon: <FaCalendarAlt /> },
  { id: "applications", label: "Pending Applications", icon: <FaExclamationTriangle /> },
  { id: "analytics", label: "Advanced Analytics", icon: <FaCogs /> },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "requested", label: "Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "learner", label: "Learners" },
  { value: "mentor", label: "Mentors" },
  { value: "admin", label: "Admins" },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [users, setUsers] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [mentorSearch, setMentorSearch] = useState("");
  const [mentorMinRating, setMentorMinRating] = useState(0);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionStatusFilter, setSessionStatusFilter] = useState("all");
  const [sessionDateFilter, setSessionDateFilter] = useState("all");
  
  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [userLimit] = useState(10);
  const [mentorPage, setMentorPage] = useState(1);
  const [mentorLimit] = useState(10);
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionLimit] = useState(10);
  
  // Date range for analytics
  const [dateRange, setDateRange] = useState("7");
  const [dateRangeCustom, setDateRangeCustom] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  
  const ratingOptions = [
  { value: 1, label: "1 Star" },
  { value: 2, label: "2 Stars" },
  { value: 3, label: "3 Stars" },
  { value: 4, label: "4 Stars" },
  { value: 5, label: "5 Stars" },
];

  
  // Session actions
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  
  // Auth token
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([
        fetchAnalytics(),
        fetchUsers(),
        fetchMentors(),
        fetchPendingMentors(),
        fetchSessions()
      ]);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("http://localhost:4000/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyticsData(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:4000/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchMentors = async () => {
    try {
      const res = await axios.get("http://localhost:4000/mentors", {
        params: { page: mentorPage, limit: mentorLimit },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMentors(res.data.data || []);
    } catch (err) {
      console.error("Error fetching mentors:", err);
    }
  };

  const fetchPendingMentors = async () => {
    try {
      const res = await axios.get("http://localhost:4000/admin/mentor-applications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingMentors(res.data);
    } catch (err) {
      console.error("Error fetching pending mentors:", err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await axios.get("http://localhost:4000/sessions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  // User Management Functions
  const handleUserSearch = (e) => {
    setUserSearch(e.target.value);
    setUserPage(1);
  };

  const handleUserRoleFilter = (e) => {
    setUserRoleFilter(e.target.value);
    setUserPage(1);
  };

  const filteredUsers = users.filter(user => {
    // Apply role filter
    if (userRoleFilter !== "all" && user.role !== userRoleFilter) {
      return false;
    }
    
    // Apply search
    if (!userSearch) return true;
    
    const search = userSearch.toLowerCase();
    const name = (user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    
    return name.includes(search) || email.includes(search);
  });

  // Mentor Management Functions
  const handleMentorSearch = (e) => {
    setMentorSearch(e.target.value);
    setMentorPage(1);
  };

  const handleMentorRatingFilter = (e) => {
    setMentorMinRating(Number(e.target.value));
    setMentorPage(1);
  };

  const filteredMentors = mentors.filter(mentor => {
    // Apply rating filter
    const rating = mentor.mentorProfile?.rating || 0;
    if (rating < mentorMinRating) return false;
    
    // Apply search
    if (!mentorSearch) return true;
    
    const search = mentorSearch.toLowerCase();
    const name = (mentor.name || "").toLowerCase();
    const email = (mentor.email || "").toLowerCase();
    const subjects = (mentor.mentorProfile?.subjects || []).join(" ").toLowerCase();
    const bio = (mentor.mentorProfile?.bio || "").toLowerCase();
    
    return name.includes(search) || 
           email.includes(search) || 
           subjects.includes(search) || 
           bio.includes(search);
  });

  // Session Management Functions
  const handleSessionSearch = (e) => {
    setSessionSearch(e.target.value);
    setSessionPage(1);
  };

  const handleSessionStatusFilter = (e) => {
    setSessionStatusFilter(e.target.value);
    setSessionPage(1);
  };

  const handleSessionDateFilter = (e) => {
    setSessionDateFilter(e.target.value);
    setSessionPage(1);
  };

  const filteredSessions = sessions.filter(session => {
    // Apply status filter
    if (sessionStatusFilter !== "all" && session.status !== sessionStatusFilter) {
      return false;
    }
    
    // Apply date filter
    if (sessionDateFilter !== "all") {
      const sessionDate = new Date(session.scheduledAt);
      const today = new Date();
      
      switch (sessionDateFilter) {
        case "today":
          return sessionDate.toDateString() === today.toDateString();
        case "week":
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(today.getDate() - 7);
          return sessionDate >= oneWeekAgo;
        case "month":
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(today.getMonth() - 1);
          return sessionDate >= oneMonthAgo;
        default:
          return true;
      }
    }
    
    // Apply search
    if (!sessionSearch) return true;
    
    const search = sessionSearch.toLowerCase();
    const mentorName = (session.mentorId?.name || "").toLowerCase();
    const learnerName = (session.learnerId?.name || "").toLowerCase();
    const mentorEmail = (session.mentorId?.email || "").toLowerCase();
    const learnerEmail = (session.learnerId?.email || "").toLowerCase();
    
    return mentorName.includes(search) || 
           learnerName.includes(search) || 
           mentorEmail.includes(search) || 
           learnerEmail.includes(search);
  });

  // Session Actions
  const handleApproveSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to approve this session?")) return;
    
    setIsApproving(true);
    try {
      await axios.patch(
        `http://localhost:4000/sessions/${sessionId}/accept`,
        { meetingLink: "https://meet.example.com/session" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh sessions
      fetchSessions();
      alert("Session approved successfully!");
    } catch (err) {
      console.error("Error approving session:", err);
      alert("Failed to approve session. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeclineSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to decline this session?")) return;
    
    setIsDeclining(true);
    try {
      await axios.patch(
        `http://localhost:4000/sessions/${sessionId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh sessions
      fetchSessions();
      alert("Session declined successfully!");
    } catch (err) {
      console.error("Error declining session:", err);
      alert("Failed to decline session. Please try again.");
    } finally {
      setIsDeclining(false);
    }
  };

  // Mentor Application Actions
  const handleApproveMentor = async (mentorId) => {
    if (!window.confirm("Are you sure you want to approve this mentor application?")) return;
    
    try {
      await axios.patch(
        `http://localhost:4000/admin/mentor-applications/${mentorId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh data
      fetchPendingMentors();
      fetchMentors();
      alert("Mentor application approved successfully!");
    } catch (err) {
      console.error("Error approving mentor:", err);
      alert("Failed to approve mentor. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy hh:mm a");
    } catch (e) {
      return dateString;
    }
  };

  // Dashboard Overview Tab
  const DashboardTab = () => {
    if (!analyticsData) return <div className="p-6">Loading dashboard...</div>;
    
    // Prepare session data for chart
    const sessionStatusData = [
      { name: "Requested", value: sessions.filter(s => s.status === "requested").length },
      { name: "Confirmed", value: sessions.filter(s => s.status === "confirmed").length },
      { name: "Completed", value: sessions.filter(s => s.status === "completed").length },
      { name: "Cancelled", value: sessions.filter(s => s.status === "cancelled").length },
      { name: "Rejected", value: sessions.filter(s => s.status === "rejected").length },
    ];
    
    // Prepare user data for chart
    const userRoleData = [
      { name: "Learners", value: users.filter(u => u.role === "learner").length },
      { name: "Mentors", value: users.filter(u => u.role === "mentor").length },
      { name: "Admins", value: users.filter(u => u.role === "admin").length },
    ];
    
    // Prepare rating data
    const ratingDistribution = [
      { name: "5 Stars", value: mentors.filter(m => m.mentorProfile?.rating >= 4.5).length },
      { name: "4 Stars", value: mentors.filter(m => m.mentorProfile?.rating >= 3.5 && m.mentorProfile?.rating < 4.5).length },
      { name: "3 Stars", value: mentors.filter(m => m.mentorProfile?.rating >= 2.5 && m.mentorProfile?.rating < 3.5).length },
      { name: "2 Stars", value: mentors.filter(m => m.mentorProfile?.rating >= 1.5 && m.mentorProfile?.rating < 2.5).length },
      { name: "1 Star", value: mentors.filter(m => m.mentorProfile?.rating < 1.5).length },
    ];

    return (
      <div className="p-6 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Platform analytics and key metrics</p>
          </div>
          <button
            onClick={fetchAllData}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            <MdRefresh className="mr-2" /> Refresh Data
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                <FaUsers className="text-indigo-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{analyticsData.totalUsers}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 text-sm">
              <span className="mr-1">↑ 12.5%</span>
              <span>from last month</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <FaChalkboardTeacher className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Mentors</p>
                <p className="text-2xl font-bold text-gray-800">{analyticsData.mentorsCount}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 text-sm">
              <span className="mr-1">↑ 8.2%</span>
              <span>from last month</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl mr-4">
                <FaUserPlus className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Learners</p>
                <p className="text-2xl font-bold text-gray-800">{analyticsData.learnersCount}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 text-sm">
              <span className="mr-1">↑ 15.7%</span>
              <span>from last month</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-xl mr-4">
                <FaCalendarAlt className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-800">{analyticsData.sessionsCount}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 text-sm">
              <span className="mr-1">↑ 22.3%</span>
              <span>from last month</span>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Status Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sessionStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sessionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User Role Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Mentor Rating Distribution</h3>
              <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                <FaStar className="mr-1" />
                {analyticsData.avgRating?.toFixed(1) || "N/A"}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.slice(0, 5).map(session => (
                  <tr key={session._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          session.status === 'completed' ? 'bg-green-100 text-green-800' :
                          session.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          session.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Session {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {session.learnerId?.name || session.learnerId?.email}
                      </div>
                      <div className="text-sm text-gray-500">with {session.mentorId?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(session.scheduledAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // User Management Tab
  const UserManagementTab = () => {
    const totalPages = Math.ceil(filteredUsers.length / userLimit);
    
    const paginatedUsers = filteredUsers.slice(
      (userPage - 1) * userLimit,
      userPage * userLimit
    );
    
    const handlePageChange = (newPage) => {
      if (newPage > 0 && newPage <= totalPages) {
        setUserPage(newPage);
      }
    };

    return (
      <div className="p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all platform users</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchUsers}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
            >
              <MdRefresh className="mr-2" /> Refresh
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
            <div className="relative flex-grow">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                value={userSearch}
                onChange={handleUserSearch}
                aria-label="Search users"
              />
            </div>

            <select
              className="border border-gray-300 rounded-xl px-4 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={userRoleFilter}
              onChange={handleUserRoleFilter}
              aria-label="Filter users by role"
            >
              {roleOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || user.email}`}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        {user.mentorProfile?.verified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Verified Mentor
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      aria-label="View user details"
                    >
                      <MdVisibility className="text-xl" />
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-900 mr-4"
                      aria-label="Edit user"
                    >
                      <MdEdit className="text-xl" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      aria-label="Delete user"
                    >
                      <MdDelete className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(userPage - 1)}
                  disabled={userPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(userPage + 1)}
                  disabled={userPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(userPage - 1) * userLimit + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(userPage * userLimit, filteredUsers.length)}</span> of{" "}
                    <span className="font-medium">{filteredUsers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(userPage - 1)}
                      disabled={userPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          userPage === i + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(userPage + 1)}
                      disabled={userPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center mb-6">
                  <img
                    className="h-20 w-20 rounded-full"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name || selectedUser.email}`}
                    alt=""
                  />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-800">{selectedUser.name}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="mt-2 flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.role === 'mentor' ? 'bg-blue-100 text-blue-800' :
                        selectedUser.role === 'learner' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                      </span>
                      {selectedUser.emailVerified && (
                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-500 text-sm">Joined</p>
                        <p className="font-medium">{format(new Date(selectedUser.createdAt), "MMM dd, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Last Active</p>
                        <p className="font-medium">Today</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Sessions Completed</p>
                        <p className="font-medium">{selectedUser.sessionsCount || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedUser.role === 'mentor' && selectedUser.mentorProfile && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Mentor Profile</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-500 text-sm">Rating</p>
                          <p className="font-medium flex items-center">
                            <FaStar className="text-yellow-400 mr-1" />
                            {selectedUser.mentorProfile.rating?.toFixed(1) || "N/A"}
                            <span className="text-gray-500 ml-1">({selectedUser.mentorProfile.ratingCount || 0})</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Hourly Rate</p>
                          <p className="font-medium">${selectedUser.mentorProfile.hourlyRate || "N/A"}/hr</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Subjects</p>
                          <p className="font-medium">{selectedUser.mentorProfile.subjects?.join(", ") || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedUser.mentorProfile && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Bio</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedUser.mentorProfile.bio || "This user has not provided a bio yet."}
                    </p>
                  </div>
                )}
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                  <button
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                  >
                    Edit User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Mentor Management Tab
  const MentorManagementTab = () => {
    const totalPages = Math.ceil(filteredMentors.length / mentorLimit);
    
    const paginatedMentors = filteredMentors.slice(
      (mentorPage - 1) * mentorLimit,
      mentorPage * mentorLimit
    );
    
    const handlePageChange = (newPage) => {
      if (newPage > 0 && newPage <= totalPages) {
        setMentorPage(newPage);
      }
    };

    return (
      <div className="p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mentor Management</h1>
            <p className="text-gray-600 mt-1">Manage and view all mentor profiles</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchMentors}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
            >
              <MdRefresh className="mr-2" /> Refresh
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
            <div className="relative flex-grow">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by name, subject, or expertise..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                value={mentorSearch}
                onChange={handleMentorSearch}
                aria-label="Search mentors"
              />
            </div>

            <select
              className="border border-gray-300 rounded-xl px-4 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={mentorMinRating}
              onChange={handleMentorRatingFilter}
              aria-label="Filter mentors by minimum rating"
            >
              {ratingOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Mentors Grid */}
        <div className="grid gap-6">
          {paginatedMentors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <FaChalkboardTeacher className="text-indigo-600 text-3xl" />
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">No mentors found</h4>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn't find any mentors matching your criteria. Try adjusting your search or rating filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {paginatedMentors.map(mentor => (
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
                            onClick={() => setSelectedMentor(mentor)}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition w-full md:w-auto"
                          >
                            View Profile
                          </button>
                          
                          <div className="flex space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              mentor.mentorProfile?.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {mentor.mentorProfile?.verified ? 'Verified' : 'Pending Verification'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(mentorPage - 1)}
                      disabled={mentorPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(mentorPage + 1)}
                      disabled={mentorPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(mentorPage - 1) * mentorLimit + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(mentorPage * mentorLimit, filteredMentors.length)}</span> of{" "}
                        <span className="font-medium">{filteredMentors.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(mentorPage - 1)}
                          disabled={mentorPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              mentorPage === i + 1
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => handlePageChange(mentorPage + 1)}
                          disabled={mentorPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Mentor Details Modal */}
        {selectedMentor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Mentor Profile</h2>
                  <button
                    onClick={() => setSelectedMentor(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center gap-6 mb-6">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMentor.name || selectedMentor.email}`}
                    alt="Mentor avatar"
                    className="w-24 h-24 rounded-full border-4 border-indigo-500"
                  />
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{selectedMentor.name}</h2>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full">
                        <FaStar className="mr-1" />
                        {selectedMentor.mentorProfile?.rating?.toFixed(1) || "N/A"}
                      </div>
                      <span className="ml-3 text-gray-600">
                        {selectedMentor.mentorProfile?.ratingCount || 0} {selectedMentor.mentorProfile?.ratingCount === 1 ? "rating" : "ratings"}
                      </span>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedMentor.mentorProfile?.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedMentor.mentorProfile?.verified ? 'Verified Mentor' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {selectedMentor.mentorProfile?.bio || "This mentor has not provided a bio yet."}
                  </p>
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
                          {selectedMentor.mentorProfile?.subjects?.join(", ") || "Various fields"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Hourly Rate</p>
                        <p className="font-medium">
                          ${selectedMentor.mentorProfile?.hourlyRate || "Custom"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Languages</p>
                        <p className="font-medium">
                          {selectedMentor.mentorProfile?.languages?.join(", ") || "English"}
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
                          {selectedMentor.mentorProfile?.timezone || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Certifications</p>
                        <p className="font-medium">
                          {selectedMentor.mentorProfile?.certifications?.join(", ") || "None listed"}
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
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={15} data={
                        (selectedMentor.mentorProfile?.subjects || []).map((sub, idx) => ({
                          name: sub,
                          value: Math.floor(Math.random() * 100) + 50,
                          fill: `hsl(${idx * 60}, 70%, 50%)`,
                        }))
                      }>
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
                </div>

                <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mt-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                    <span className="bg-indigo-100 p-2 rounded-md mr-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 01-2-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 6h5M7 10h3m-3 4h9m-9 4H6a2 2 0 01-2-2v-5a2 2 0 012-2h9a2 2 0 012 2v5a2 2 0 01-2 2h-4m-5-4v5"></path>
                      </svg>
                    </span>
                    Portfolio
                  </h3>
                  <ul className="list-disc list-inside space-y-2 max-w-xl">
                    {selectedMentor.mentorProfile?.portfolio?.length ? (
                      selectedMentor.mentorProfile.portfolio.map((item, i) => (
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
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedMentor(null)}
                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                  {!selectedMentor.mentorProfile?.verified && (
                    <button
                      onClick={() => handleApproveMentor(selectedMentor._id)}
                      className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                    >
                      Verify Mentor
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Session Management Tab
  const SessionManagementTab = () => {
    const totalPages = Math.ceil(filteredSessions.length / sessionLimit);
    
    const paginatedSessions = filteredSessions.slice(
      (sessionPage - 1) * sessionLimit,
      sessionPage * sessionLimit
    );
    
    const handlePageChange = (newPage) => {
      if (newPage > 0 && newPage <= totalPages) {
        setSessionPage(newPage);
      }
    };

    return (
      <div className="p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Session Management</h1>
            <p className="text-gray-600 mt-1">Manage all platform sessions</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchSessions}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
            >
              <MdRefresh className="mr-2" /> Refresh
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
            <div className="relative flex-grow">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by mentor or learner name..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                value={sessionSearch}
                onChange={handleSessionSearch}
                aria-label="Search sessions"
              />
            </div>

            <select
              className="border border-gray-300 rounded-xl px-4 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={sessionStatusFilter}
              onChange={handleSessionStatusFilter}
              aria-label="Filter sessions by status"
            >
              {statusOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            
            <select
              className="border border-gray-300 rounded-xl px-4 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={sessionDateFilter}
              onChange={handleSessionDateFilter}
              aria-label="Filter sessions by date"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>
        </div>
        
        {/* Sessions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSessions.map(session => (
                <tr key={session._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {session.mentorId?.name || session.mentorId?.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.mentorId?.mentorProfile?.subjects?.slice(0, 2).join(", ") || "Various"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.mentorId?.name || session.mentorId?.email}`}
                          alt=""
                        />
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{session.mentorId?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`https://api.dicebear.com/7/x/avataaars/svg?seed=${session.learnerId?.name || session.learnerId?.email}`}
                          alt=""
                        />
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{session.learnerId?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(session.scheduledAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.durationMinutes} minutes
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      session.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                      session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      aria-label="View session details"
                    >
                      <MdVisibility className="text-xl" />
                    </button>
                    {session.status === 'requested' && (
                      <>
                        <button
                          onClick={() => handleApproveSession(session._id)}
                          disabled={isApproving}
                          className={`text-green-600 hover:text-green-900 mr-4 ${
                            isApproving ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          aria-label="Approve session"
                        >
                          {isApproving ? (
                            <FaSpinner className="animate-spin text-xl" />
                          ) : (
                            <FaCheckCircle className="text-xl" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeclineSession(session._id)}
                          disabled={isDeclining}
                          className={`text-red-600 hover:text-red-900 ${
                            isDeclining ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          aria-label="Decline session"
                        >
                          {isDeclining ? (
                            <FaSpinner className="animate-spin text-xl" />
                          ) : (
                            <MdDelete className="text-xl" />
                          )}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(sessionPage - 1)}
                  disabled={sessionPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(sessionPage + 1)}
                  disabled={sessionPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(sessionPage - 1) * sessionLimit + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(sessionPage * sessionLimit, filteredSessions.length)}</span> of{" "}
                    <span className="font-medium">{filteredSessions.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(sessionPage - 1)}
                      disabled={sessionPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          sessionPage === i + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(sessionPage + 1)}
                      disabled={sessionPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Session Details Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Session Details</h2>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="bg-white rounded-xl shadow p-5 border border-gray-100 mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                        <span className="bg-indigo-100 p-2 rounded-md mr-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </span>
                        Participants
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-full"
                              src={`https://api.dicebear.com/7/x/avataaars/svg?seed=${selectedSession.mentorId?.name || selectedSession.mentorId?.email}`}
                              alt=""
                            />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">Mentor</p>
                            <p className="text-gray-700">{selectedSession.mentorId?.name}</p>
                            <p className="text-gray-500 text-sm">{selectedSession.mentorId?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-full"
                              src={`https://api.dicebear.com/7/x/avataaars/svg?seed=${selectedSession.learnerId?.name || selectedSession.learnerId?.email}`}
                              alt=""
                            />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">Learner</p>
                            <p className="text-gray-700">{selectedSession.learnerId?.name}</p>
                            <p className="text-gray-500 text-sm">{selectedSession.learnerId?.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                      <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                        <span className="bg-indigo-100 p-2 rounded-md mr-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </span>
                        Session Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-500 text-sm">Date & Time</p>
                          <p className="font-medium">{formatDate(selectedSession.scheduledAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Duration</p>
                          <p className="font-medium">{selectedSession.durationMinutes} minutes</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Channel</p>
                          <p className="font-medium capitalize">{selectedSession.channel}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Status</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedSession.status === 'completed' ? 'bg-green-100 text-green-800' :
                            selectedSession.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            selectedSession.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                            selectedSession.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
                          </span>
                        </div>
                        {selectedSession.meetingLink && (
                          <div>
                            <p className="text-gray-500 text-sm">Meeting Link</p>
                            <a
                              href={selectedSession.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline break-all"
                            >
                              {selectedSession.meetingLink}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                      <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                        <span className="bg-indigo-100 p-2 rounded-md mr-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </span>
                        Session Notes
                      </h3>
                      <div className="space-y-3">
                        {selectedSession.notes ? (
                          <p className="text-gray-700 leading-relaxed">{selectedSession.notes}</p>
                        ) : (
                          <p className="text-gray-500 italic">No notes provided for this session.</p>
                        )}
                      </div>
                    </div>
                    
                    {selectedSession.resources && selectedSession.resources.length > 0 && (
                      <div className="bg-white rounded-xl shadow p-5 border border-gray-100 mt-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                          <span className="bg-indigo-100 p-2 rounded-md mr-2">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 01-2-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 6h5M7 10h3m-3 4h9m-9 4H6a2 2 0 01-2-2v-5a2 2 0 012-2h9a2 2 0 012 2v5a2 2 0 01-2 2h-4m-5-4v5"></path>
                            </svg>
                          </span>
                          Resources
                        </h3>
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
                    
                    {selectedSession.rating && (
                      <div className="bg-white rounded-xl shadow p-5 border border-gray-100 mt-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                          <span className="bg-indigo-100 p-2 rounded-md mr-2">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                          </span>
                          Rating & Review
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <div className="flex text-yellow-400 text-xl">
                              {'★'.repeat(selectedSession.rating)}
                              {'☆'.repeat(5 - selectedSession.rating)}
                            </div>
                            <span className="ml-2 font-medium text-lg">{selectedSession.rating}/5</span>
                          </div>
                          {selectedSession.review && (
                            <blockquote className="italic border-l-4 border-indigo-200 pl-4 py-2 bg-gray-50 rounded">
                              "{selectedSession.review}"
                            </blockquote>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                  {selectedSession.status === 'requested' && (
                    <>
                      <button
                        onClick={() => handleDeclineSession(selectedSession._id)}
                        disabled={isDeclining}
                        className={`px-5 py-2 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition ${
                          isDeclining ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isDeclining ? (
                          <span className="flex items-center">
                            <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Declining...
                          </span>
                        ) : (
                          "Decline Session"
                        )}
                      </button>
                      <button
                        onClick={() => handleApproveSession(selectedSession._id)}
                        disabled={isApproving}
                        className={`px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition ${
                          isApproving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isApproving ? (
                          <span className="flex items-center">
                            <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Approving...
                          </span>
                        ) : (
                          "Approve Session"
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Pending Applications Tab
  const PendingApplicationsTab = () => {
    return (
      <div className="p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pending Mentor Applications</h1>
            <p className="text-gray-600 mt-1">Review and approve new mentor applications</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchPendingMentors}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
            >
              <MdRefresh className="mr-2" /> Refresh
            </button>
          </div>
        </div>
        
        {pendingMentors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <FaExclamationTriangle className="text-indigo-600 text-3xl" />
              </div>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">No pending applications</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              There are currently no mentor applications pending review. Check back later for new applications.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingMentors.map(mentor => (
              <div
                key={mentor._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <img
                        src={`https://api.dicebear.com/7/x/avataaars/svg?seed=${mentor.name || mentor.email}`}
                        alt="Mentor avatar"
                        className="w-16 h-16 rounded-full border-2 border-indigo-500"
                      />
                      <div className="ml-4">
                        <h4 className="text-xl font-bold text-gray-800">{mentor.name}</h4>
                        <p className="text-gray-600">{mentor.email}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-gray-500 text-sm">Subjects</p>
                        <p className="font-medium">
                          {mentor.mentorProfile?.subjects?.join(", ") || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-gray-500 text-sm">Hourly Rate</p>
                        <p className="font-medium">
                          ${mentor.mentorProfile?.hourlyRate || "Not specified"}/hr
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-gray-500 text-sm">Languages</p>
                        <p className="font-medium">
                          {mentor.mentorProfile?.languages?.join(", ") || "Not specified"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Bio</h5>
                      <p className="text-gray-700 leading-relaxed">
                        {mentor.mentorProfile?.bio || "This user has not provided a bio yet."}
                      </p>
                    </div>
                    
                    {mentor.mentorProfile?.portfolio && mentor.mentorProfile.portfolio.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Portfolio</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {mentor.mentorProfile.portfolio.map((item, i) => (
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
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-3 md:items-end">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Pending Verification
                    </span>
                    <button
                      onClick={() => handleApproveMentor(mentor._id)}
                      className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                    >
                      Approve Mentor
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Analytics Tab
  const AnalyticsTab = () => {
    // Prepare session data for charts
    const sessionStatusData = [
      { name: "Requested", value: sessions.filter(s => s.status === "requested").length },
      { name: "Confirmed", value: sessions.filter(s => s.status === "confirmed").length },
      { name: "Completed", value: sessions.filter(s => s.status === "completed").length },
      { name: "Cancelled", value: sessions.filter(s => s.status === "cancelled").length },
      { name: "Rejected", value: sessions.filter(s => s.status === "rejected").length },
    ];
    
    // Prepare user data for charts
    const userRoleData = [
      { name: "Learners", value: users.filter(u => u.role === "learner").length },
      { name: "Mentors", value: users.filter(u => u.role === "mentor").length },
      { name: "Admins", value: users.filter(u => u.role === "admin").length },
    ];
    
    // Prepare rating data
    const ratingDistribution = [
      { name: "5 Stars", value: mentors.filter(m => m.mentorProfile?.rating >= 4.5).length },
      { name: "4 Stars", value: mentors.filter(m => m.mentorProfile?.rating >= 3.5 && m.mentorProfile?.rating < 4.5).length },
      { name: "3 Stars", value: mentors.filter(m => m.mentorProfile?.rating >= 2.5 && m.mentorProfile?.rating < 3.5).length },
      { name: "2 Stars", value: mentors.filter(m => m.mentorProfile?.rating >= 1.5 && m.mentorProfile?.rating < 2.5).length },
      { name: "1 Star", value: mentors.filter(m => m.mentorProfile?.rating < 1.5).length },
    ];
    
    // Generate date range for session timeline
    const generateDateRange = (startDate, endDate) => {
      const dates = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return dates;
    };
    
    const startDate = new Date(dateRangeCustom.start);
    const endDate = new Date(dateRangeCustom.end);
    const dateRangeDates = generateDateRange(startDate, endDate);
    
    // Prepare session timeline data
    const sessionTimelineData = dateRangeDates.map(date => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const sessionsOnDate = sessions.filter(session => 
        format(new Date(session.scheduledAt), 'yyyy-MM-dd') === formattedDate
      );
      
      return {
        date: format(date, 'MMM dd'),
        total: sessionsOnDate.length,
        completed: sessionsOnDate.filter(s => s.status === 'completed').length,
        confirmed: sessionsOnDate.filter(s => s.status === 'confirmed').length,
        requested: sessionsOnDate.filter(s => s.status === 'requested').length
      };
    });

    return (
      <div className="p-6 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Advanced Analytics</h1>
            <p className="text-gray-600 mt-1">Detailed platform metrics and insights</p>
          </div>
          <div className="flex space-x-3">
            <select
              className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                if (e.target.value !== "custom") {
                  const today = new Date();
                  let startDate;
                  
                  switch (e.target.value) {
                    case "7":
                      startDate = subDays(today, 7);
                      break;
                    case "30":
                      startDate = subDays(today, 30);
                      break;
                    case "90":
                      startDate = subDays(today, 90);
                      break;
                    default:
                      startDate = subDays(today, 7);
                  }
                  
                  setDateRangeCustom({
                    start: format(startDate, 'yyyy-MM-dd'),
                    end: format(today, 'yyyy-MM-dd')
                  });
                }
              }}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {dateRange === "custom" && (
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRangeCustom.start}
                  onChange={(e) => setDateRangeCustom(prev => ({ ...prev, start: e.target.value }))}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <span className="flex items-center">to</span>
                <input
                  type="date"
                  value={dateRangeCustom.end}
                  onChange={(e) => setDateRangeCustom(prev => ({ ...prev, end: e.target.value }))}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            )}
            
            <button
              onClick={fetchAllData}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              <MdRefresh className="mr-2" /> Refresh Data
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                <FaUsers className="text-indigo-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{analyticsData?.totalUsers || 0}</p>
              </div>
            </div>
            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userRoleData}>
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <FaChalkboardTeacher className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Mentors</p>
                <p className="text-2xl font-bold text-gray-800">{analyticsData?.mentorsCount || 0}</p>
              </div>
            </div>
            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution.slice(0, 3)}>
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl mr-4">
                <FaUserPlus className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Learners</p>
                <p className="text-2xl font-bold text-gray-800">{analyticsData?.learnersCount || 0}</p>
              </div>
            </div>
            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "New", value: users.filter(u => u.role === "learner" && new Date(u.createdAt) > subDays(new Date(), 7)).length },
                  { name: "Active", value: users.filter(u => u.role === "learner" && sessions.some(s => s.learnerId === u._id)).length },
                  { name: "Inactive", value: users.filter(u => u.role === "learner" && !sessions.some(s => s.learnerId === u._id)).length }
                ]}>
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-xl mr-4">
                <FaCalendarAlt className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-800">{analyticsData?.sessionsCount || 0}</p>
              </div>
            </div>
            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionStatusData.slice(0, 3)}>
                  <Bar dataKey="value" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Timeline</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#00C49F" name="Completed" />
                  <Bar dataKey="confirmed" stackId="a" fill="#0088FE" name="Confirmed" />
                  <Bar dataKey="requested" stackId="a" fill="#FFBB28" name="Requested" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mentor Rating Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Rated Mentors</h3>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                <FaStar className="mr-1 inline" />
                {analyticsData?.avgRating?.toFixed(1) || "N/A"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mentors
                    .filter(m => m.mentorProfile?.rating)
                    .sort((a, b) => (b.mentorProfile?.rating || 0) - (a.mentorProfile?.rating || 0))
                    .slice(0, 5)
                    .map(mentor => (
                      <tr key={mentor._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={`https://api.dicebear.com/7/x/avataaars/svg?seed=${mentor.name || mentor.email}`}
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{mentor.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaStar className="text-yellow-400 mr-1" />
                            <span className="font-medium">{mentor.mentorProfile?.rating?.toFixed(1)}</span>
                            <span className="text-gray-500 ml-1">({mentor.mentorProfile?.ratingCount || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sessions.filter(s => s.mentorId === mentor._id).length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {mentor.mentorProfile?.subjects?.slice(0, 2).map((subject, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs"
                              >
                                {subject}
                              </span>
                            ))}
                            {mentor.mentorProfile?.subjects?.length > 2 && (
                              <span className="text-gray-500 text-xs">
                                +{mentor.mentorProfile.subjects.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            mentor.mentorProfile?.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {mentor.mentorProfile?.verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Sidebar = () => (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="flex items-center mb-8">
        <FaChartLine className="text-indigo-600 text-2xl mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
      </div>
      <ul className="space-y-1">
        {sidebarItems.map((item) => (
          <li
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
            }}
            className={`cursor-pointer p-3 rounded-xl flex items-center space-x-3 transition-all ${
              activeTab === item.id 
                ? "bg-indigo-600 text-white shadow-md" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      
      <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <h3 className="font-semibold text-indigo-800 mb-2 flex items-center">
          <FaThumbsUp className="mr-2" /> Quick Actions
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab("applications")}
            className="w-full text-left px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            Review Mentor Applications
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className="w-full text-left px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            Manage Pending Sessions
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className="w-full text-left px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            View Platform Analytics
          </button>
        </div>
      </div>
    </nav>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "users":
        return <UserManagementTab />;
      case "mentors":
        return <MentorManagementTab />;
      case "sessions":
        return <SessionManagementTab />;
      case "applications":
        return <PendingApplicationsTab />;
      case "analytics":
        return <AnalyticsTab />;
      default:
        return <DashboardTab />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading Dashboard</h2>
          <p className="text-gray-600 mt-2">Please wait while we prepare your admin dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-grow bg-gray-50">{renderContent()}</main>
    </div>
  );
}
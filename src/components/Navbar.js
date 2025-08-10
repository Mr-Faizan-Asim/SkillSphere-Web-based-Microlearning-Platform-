// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    navigate("/");  // redirect to home or signin after logout
  };

  const handleUserClick = () => {
    const storedUser = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    console.log("User:", storedUser ? JSON.parse(storedUser) : null);
    console.log("Token:", token);
     if (!user || !user.role) return;

    const role = user.role.toLowerCase();
    const dashboardPath = `/dashboard/${role}`;

    navigate(dashboardPath);
  };

  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <div className="bg-indigo-600 text-white font-bold rounded-lg w-10 h-10 flex items-center justify-center">SS</div>
                <span className="ml-2 text-xl font-bold text-gray-900">SkillSphere</span>
              </div>
            </div>
            {/* Desktop Menu */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link to="/" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Home</Link>
              <Link to="/features" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Features</Link>
              <Link to="/how-it-works" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">How it Works</Link>
              <Link to="/pricing" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Pricing</Link>
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {user ? (
              <>
                <div 
                  onClick={handleUserClick}
                  className="flex items-center space-x-3 cursor-pointer select-none"
                  title="Click to see user & token details in console"
                >
                  <div className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold">
                    {avatarInitial}
                  </div>
                  <span className="text-gray-700 font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Sign In</Link>
                <Link to="/mentor/signin" className="ml-3 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium border border-gray-300">Sign In as Mentor</Link>
                <Link to="/register" className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Home</Link>
            <Link to="/features" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Features</Link>
            <Link to="/how-it-works" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">How it Works</Link>
            <Link to="/pricing" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Pricing</Link>

            <div className="mt-4 pt-4 border-t border-gray-200 px-4">
              {user ? (
                <>
                  <div 
                    onClick={handleUserClick}
                    className="flex items-center space-x-3 cursor-pointer select-none py-2"
                    title="Click to see user & token details in console"
                  >
                    <div className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold">
                      {avatarInitial}
                    </div>
                    <span
  className="text-gray-700 font-medium cursor-pointer hover:underline"
  onClick={handleUserClick}
  role="link"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") handleUserClick();
  }}
>
  {user.name}
</span>

                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 bg-red-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="block w-full text-center text-gray-500 px-4 py-2 text-base font-medium hover:bg-gray-50 rounded-md">Sign In</Link>
                  <Link to="/mentor/signin" className="block w-full mt-2 text-gray-500 px-4 py-2 text-base font-medium border border-gray-300 rounded-md hover:bg-gray-50">Sign In as Mentor</Link>
                  <Link to="/register" className="block w-full mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-indigo-700">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

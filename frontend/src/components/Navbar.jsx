import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Package, User, Sun, Moon, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800/80 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* Logo - Left */}
          <div className="flex-shrink-0 flex items-center">
            <Link to={user ? `/${user.role}/dashboard` : "/"} className="flex items-center gap-2 group">
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-widest uppercase">
                LOGITRACK
              </span>
            </Link>
          </div>

          {/* Centered Navigation Links */}
          {user && (user.role === 'customer' || user.role === 'agent') && (
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              <Link 
                to={`/${user.role}/dashboard`} 
                className="text-sm font-semibold text-gray-900 dark:text-white border-b-2 border-orange-500 pb-1"
              >
                Dashboard
              </Link>
              <Link 
                to={user.role === 'customer' ? "/customer/history" : `/${user.role}/dashboard`} 
                className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors pb-1"
              >
                Orders
              </Link>
              <Link 
                to={`/${user.role}/dashboard`} 
                className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors pb-1"
              >
                Tracking
              </Link>
            </div>
          )}

          {/* Actions - Right */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-gray-950"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 ml-1">
                  <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <User className="h-4 w-4" />
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-all rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 ml-1"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <a href="/#about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-all hidden sm:block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">About Us</a>
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-all px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Login</Link>
                <Link to="/register" className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 py-2 hover:shadow-lg hover:shadow-orange-600/20 transition-all duration-300 rounded-lg active:scale-95">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

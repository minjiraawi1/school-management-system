import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLogout } from '../store/authSlice';
import { Search, LogOut, User, ChevronDown, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const Topbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(setLogout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 md:ml-64 transition-all duration-300">
      <div className="flex items-center justify-between h-20 px-4 md:px-8">
        {/* Logo/Brand - only visible on mobile */}
        <div className="md:hidden flex items-center">
          <h1 className="text-lg font-bold text-indigo-600 tracking-tight">SchoolHub</h1>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white border focus:border-indigo-500 rounded-xl text-sm transition-all duration-200 outline-none text-slate-600 placeholder:text-slate-400"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
          </form>
        </div>

        {/* Right Side - Profile and Logout */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Mobile Search Button */}
          <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <Search size={20} />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 pl-2 pr-1 py-1.5 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
            >
              <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-indigo-500/20">
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </div>
              <div className="hidden md:block text-left mr-2">
                <p className="text-sm font-semibold text-slate-700 leading-none">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[11px] text-slate-500 font-medium capitalize mt-0.5">{user?.role}</p>
              </div>
              <ChevronDown size={16} className={`text-slate-400 hidden md:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info */}
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize mt-0.5">{user?.role}</p>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate(`/${user?.role}/profile`);
                    }}
                    className="w-full px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl flex items-center space-x-3 transition-all font-medium"
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center space-x-3 transition-all font-medium"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

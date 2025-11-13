import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  BarChart3,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setLogout } from '../store/authSlice';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const getNavigationItems = () => {
    if (user?.role === 'admin') {
      return [
        {
          to: '/admin/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          to: '/admin/classes',
          label: 'Classes',
          icon: BookOpen,
        },
        {
          to: '/admin/subjects',
          label: 'Subjects',
          icon: Award,
        },
        {
          to: '/admin/teachers',
          label: 'Teachers',
          icon: Users,
        },
        {
          to: '/admin/students',
          label: 'Students',
          icon: Users,
        },
        {
          to: '/admin/assignments',
          label: 'Assignments',
          icon: BarChart3,
        },
      ];
    } else if (user?.role === 'teacher') {
      return [
        {
          to: '/teacher/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          to: '/teacher/select-assignment',
          label: 'Manage Results',
          icon: BarChart3,
        },
      ];
    } else if (user?.role === 'student') {
      return [
        {
          to: '/student/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          to: '/student/results',
          label: 'View Results',
          icon: BarChart3,
        },
      ];
    }
    return [];
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    dispatch(setLogout());
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 left-4 z-40 md:hidden bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-2 rounded-lg hover:shadow-lg transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-indigo-600 to-indigo-800 text-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="pt-6 px-6 pb-8 border-b border-indigo-500 flex-shrink-0">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <BookOpen size={24} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SchoolHub</h1>
            </div>
          </div>
          <p className="text-xs text-indigo-200 text-center">Education Management System</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 pt-6 md:pt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-white text-indigo-700 font-semibold shadow-lg'
                    : 'text-indigo-100 hover:bg-indigo-500/50'
                }`}
              >
                <Icon size={20} className={active ? '' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-medium">{item.label}</span>
                {active && <div className="ml-auto w-1 h-5 bg-indigo-700 rounded-full"></div>}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-indigo-500 flex-shrink-0"></div>

        {/* User Profile Section */}
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-indigo-500/50 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-300 to-indigo-400 rounded-full flex items-center justify-center text-sm font-bold text-indigo-900 flex-shrink-0">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.first_name}</p>
              <p className="text-xs text-indigo-200 capitalize truncate">{user?.role}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white font-medium transition-colors group"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

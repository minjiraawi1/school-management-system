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
  CheckCircle,
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
          to: '/admin/approvals',
          label: 'Approvals',
          icon: CheckCircle,
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
        className="fixed top-24 left-4 z-40 md:hidden bg-linear-to-r from-indigo-600 to-indigo-700 text-white p-2 rounded-lg hover:shadow-lg transition-all"
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
        className={`fixed md:fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 border-r border-slate-800`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">SchoolHub</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`} />
                <span className="font-medium text-sm">{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 mb-3 border border-slate-700/50">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.first_name}</p>
              <p className="text-xs text-slate-400 capitalize truncate">{user?.role}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 font-medium transition-all duration-200 group border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

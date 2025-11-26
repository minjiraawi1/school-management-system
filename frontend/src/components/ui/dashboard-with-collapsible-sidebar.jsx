"use client"
import React, { useState, useEffect } from "react";
import {
  Home,
  DollarSign,
  Monitor,
  ShoppingCart,
  Tag,
  BarChart3,
  Users,
  ChevronDown,
  ChevronsRight,
  Moon,
  Sun,
  TrendingUp,
  Activity,
  Package,
  Bell,
  Settings,
  HelpCircle,
  User,
  LogOut,
  BookOpen,
  GraduationCap,
  FileText,
  CheckCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "../../store/authSlice";
import { useTheme } from "../ThemeProvider";

export const DashboardLayoutNew = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const setIsDark = (val) => {
    setTheme(val ? 'dark' : 'light');
  };

  return (
    <div className={`flex min-h-screen w-full ${isDark ? 'dark' : ''}`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header isDark={isDark} setIsDark={setIsDark} />
            <div className="flex-1 overflow-auto p-6">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(setLogout());
    navigate('/login');
  };

  // Define menu items based on role
  const getMenuItems = () => {
    const role = user?.role;
    
    const commonItems = [
      { icon: Home, title: "Dashboard", path: `/${role}/dashboard` },
    ];

    if (role === 'admin') {
      return [
        ...commonItems,
        { icon: CheckCircle, title: "Approvals", path: "/admin/approvals" },
        { icon: GraduationCap, title: "Classes", path: "/admin/classes" },
        { icon: BookOpen, title: "Subjects", path: "/admin/subjects" },
        { icon: User, title: "Teachers", path: "/admin/teachers" },
        { icon: Users, title: "Students", path: "/admin/students" },
        { icon: FileText, title: "Assignments", path: "/admin/assignments" },
      ];
    } else if (role === 'teacher') {
      return [
        ...commonItems,
        { icon: BarChart3, title: "Results", path: "/teacher/select-assignment" },
      ];
    } else if (role === 'student') {
      return [
        ...commonItems,
        { icon: BarChart3, title: "My Results", path: "/student/results" },
      ];
    }
    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <nav
      className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
        open ? 'w-64' : 'w-16'
      } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm flex flex-col z-50`}
    >
      <TitleSection open={open} user={user} />

      <div className="space-y-1 mb-8 flex-1">
        {menuItems.map((item) => (
            <Option
                key={item.title}
                Icon={item.icon}
                title={item.title}
                selected={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
                onClick={() => navigate(item.path)}
                open={open}
            />
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1 mb-12">
        {open && (
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Account
            </div>
        )}
        <Option
            Icon={LogOut}
            title="Sign Out"
            selected={false}
            onClick={handleLogout}
            open={open}
        />
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

const Option = ({ Icon, title, selected, onClick, open, notifs }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
        selected 
          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>
      
      {open && (
        <span
          className={`text-sm font-medium transition-opacity duration-200 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {title}
        </span>
      )}

      {notifs && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-xs text-white font-medium">
          {notifs}
        </span>
      )}
    </button>
  );
};

const TitleSection = ({ open, user }) => {
  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center gap-3">
          <Logo />
          {open && (
            <div className={`transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    SchoolHub
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role || 'User'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
      <GraduationCap className="text-white h-6 w-6" />
    </div>
  );
};

const ToggleClose = ({ open, setOpen }) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        {open && (
          <span
            className={`text-sm font-medium text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Hide
          </span>
        )}
      </div>
    </button>
  );
};

const Header = ({ isDark, setIsDark }) => {
    const { user } = useSelector((state) => state.auth);
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.first_name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Here's what's happening with your school today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user?.first_name?.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    );
};

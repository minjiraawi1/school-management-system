import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar - Fixed at top, spans full width */}
      <Topbar />

      {/* Sidebar - Fixed on desktop, below topbar */}
      <div className="hidden md:block w-64 fixed left-0 top-20 h-[calc(100vh-80px)] z-40">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {/* Main Content - Positioned below topbar, offset by sidebar on desktop */}
      <main className="pt-20 md:ml-64 min-h-[calc(100vh-80px)] overflow-auto bg-gray-50">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
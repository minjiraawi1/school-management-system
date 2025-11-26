import { DashboardLayoutNew } from './ui/dashboard-with-collapsible-sidebar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <DashboardLayoutNew>
      <Outlet />
    </DashboardLayoutNew>
  );
};

export default DashboardLayout;
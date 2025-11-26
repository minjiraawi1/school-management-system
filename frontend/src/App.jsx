import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';
import { restoreAuth } from './store/authSlice';
import { ThemeProvider } from './components/ThemeProvider';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedTeacherRoute from './components/ProtectedTeacherRoute';
import ProtectedStudentRoute from './components/ProtectedStudentRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageClasses from './pages/admin/ManageClasses.jsx';
import ManageSubjects from './pages/admin/ManageSubjects.jsx';
import ManageStudents from './pages/admin/ManageStudents.jsx';
import ManageTeachers from './pages/admin/ManageTeachers.jsx';
import ManageAssignments from './pages/admin/ManageAssignments.jsx';
import ResultsApproval from './pages/admin/ResultsApproval.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import TeacherResultsManagement from './pages/teacher/TeacherResultsManagement.jsx';
import SelectAssignments from './pages/teacher/SelectAssignments.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentResultsView from './pages/student/StudentResultsView.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function AppContent() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Restore authentication state from localStorage on app load
    dispatch(restoreAuth());
    setAuthChecked(true);
  }, [dispatch]);

  // Don't render routes until auth is restored
  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<div className="flex items-center justify-center h-screen"><div className="text-2xl font-bold text-gray-700">Unauthorized Access</div></div>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminRoute><DashboardLayout /></ProtectedAdminRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="classes" element={<ManageClasses />} />
          <Route path="subjects" element={<ManageSubjects />} />
          <Route path="teachers" element={<ManageTeachers />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="assignments" element={<ManageAssignments />} />
          <Route path="approvals" element={<ResultsApproval />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<ProtectedTeacherRoute><DashboardLayout /></ProtectedTeacherRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="select-assignment" element={<SelectAssignments />} />
          <Route path="results" element={<TeacherResultsManagement />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedStudentRoute><DashboardLayout /></ProtectedStudentRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="results" element={<StudentResultsView />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;

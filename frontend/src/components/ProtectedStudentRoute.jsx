import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedStudentRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'student') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedStudentRoute;

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedTeacherRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'teacher') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedTeacherRoute;
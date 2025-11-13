import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLogin, setLoading, setError } from '../store/authSlice';
import { authAPI } from '../services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await authAPI.login(formData);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Update Redux store
      dispatch(setLogin({
        user: response.user,
        token: response.token,
      }));

      // Redirect based on role
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      dispatch(setError(errorMessage));
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  const quickFill = (username, password) => {
    setFormData({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-10 sm:py-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              School Result System
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form Section */}
          <div className="px-6 sm:px-8 py-8 sm:py-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-500 text-gray-900"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-500 text-gray-900"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Error Message */}
            {false && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                Error message will appear here
              </div>
            )}
          </div>

          {/* Quick Access Section */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 sm:px-8 py-8">
            <p className="text-center text-sm font-medium text-gray-700 mb-4">
              Quick Test Access
              <span className="ml-2 text-xs text-gray-500">(Development Only)</span>
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => quickFill('admin', 'admin123')}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-sm font-medium transition-colors border border-blue-200"
              >
                <span className="font-bold">👤 Admin</span>
                <span className="text-xs block mt-1 opacity-75">
                  username: <code className="font-mono bg-blue-200 px-2 py-0.5 rounded">admin</code> • password: <code className="font-mono bg-blue-200 px-2 py-0.5 rounded">admin123</code>
                </span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('teacher1', 'teacher123')}
                className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-sm font-medium transition-colors border border-purple-200"
              >
                <span className="font-bold">📚 Teacher</span>
                <span className="text-xs block mt-1 opacity-75">
                  username: <code className="font-mono bg-purple-200 px-2 py-0.5 rounded">teacher1</code> • password: <code className="font-mono bg-purple-200 px-2 py-0.5 rounded">teacher123</code>
                </span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('student1', 'student123')}
                className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 text-green-900 rounded-lg text-sm font-medium transition-colors border border-green-200"
              >
                <span className="font-bold">👨‍🎓 Student</span>
                <span className="text-xs block mt-1 opacity-75">
                  username: <code className="font-mono bg-green-200 px-2 py-0.5 rounded">student1</code> • password: <code className="font-mono bg-green-200 px-2 py-0.5 rounded">student123</code>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-indigo-100 text-xs mt-6">
          Need help? Contact your administrator
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
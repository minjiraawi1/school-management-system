import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { BookOpen, BarChart3, Award, TrendingUp, AlertCircle } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    subjects: 0,
    classInfo: null,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get student info with class details
      try {
        const studentResponse = await api.get(`/students`);
        const students = studentResponse.data || [];
        const currentStudent = students.find(s => s.email === user?.email);
        
        if (currentStudent) {
          setStats(prev => ({
            ...prev,
            classInfo: {
              name: currentStudent.class_name,
              gradeLevel: currentStudent.grade_level,
              academicYear: currentStudent.academic_year,
            },
            subjects: 0, // Will update from results
          }));
        }
      } catch (e) {
        console.log('Could not load class info');
      }

      // Get student results
      try {
        const resultsResponse = await api.get('/results');
        const allResults = resultsResponse.data || [];
        
        // Filter results for this student by email
        const studentResults = allResults.filter(r => r.student_email === user?.email || r.student_id === user?.id);
        setResults(studentResults);

        // Count unique subjects
        const uniqueSubjects = new Set(studentResults.map(r => r.subject_id)).size;
        setStats(prev => ({
          ...prev,
          subjects: uniqueSubjects,
        }));
      } catch (e) {
        console.log('Could not load results');
      }
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
    </div>
  );

  const ResultCard = ({ subject, score, grade }) => {
    const gradeColor = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800',
    }[grade] || 'bg-gray-100 text-gray-800';

    return (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-indigo-600">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{subject}</h3>
            <p className="text-2xl font-bold text-indigo-600 mt-3">{score}%</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-bold text-lg ${gradeColor}`}>
            {grade}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.first_name}! 👋</h1>
        <p className="text-green-100 text-lg">
          View your academic performance and results
        </p>
        {stats.classInfo && (
          <div className="mt-4 text-green-50">
            <p className="text-sm">Grade Level: <span className="font-semibold">{stats.classInfo.gradeLevel}</span></p>
            <p className="text-sm">Class: <span className="font-semibold">{stats.classInfo.name}</span></p>
            <p className="text-sm">Academic Year: <span className="font-semibold">{stats.classInfo.academicYear}</span></p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon={BookOpen}
            label="Enrolled Subjects"
            value={stats.subjects}
            color="border-blue-500"
          />
          <StatCard
            icon={BarChart3}
            label="Total Results"
            value={results.length}
            color="border-green-500"
          />
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Results</h2>
          <button
            onClick={() => navigate('/student/results')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            View Detailed Results
          </button>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.slice(0, 6).map((result, idx) => (
              <ResultCard
                key={idx}
                subject={result.subject_name || result.subject_id}
                score={result.final_score || 'N/A'}
                grade={result.grade || 'N/A'}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Award size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No results available yet</p>
            <p className="text-gray-500 text-sm mt-2">Your results will appear here as they are posted by teachers</p>
          </div>
        )}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📚 About Your Results</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Results are calculated from monthly tests and exams</li>
            <li>• Your final score is the average of Term 1 and Term 2</li>
            <li>• Grades are assigned based on your final score percentage</li>
            <li>• Grading scale: A (90-100), B (80-89), C (70-79), D (60-69), F (0-59)</li>
          </ul>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-bold text-green-900 mb-3">🎯 Performance Tips</h3>
          <ul className="text-sm text-green-800 space-y-2">
            <li>• Check your results regularly to track progress</li>
            <li>• Review areas where you scored lower for improvement</li>
            <li>• Communicate with teachers for academic support</li>
            <li>• Set goals and work towards achieving higher grades</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

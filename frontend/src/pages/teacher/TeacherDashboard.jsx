import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Users, TrendingUp, BarChart3 } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalResults: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assignments/teacher/me');
      setAssignments(response.data || []);

      // Calculate statistics
      try {
        const resultsResponse = await api.get('/results');
        const allResults = resultsResponse.data || [];
        
        let validScores = [];
        allResults.forEach(r => {
          const scores = [
            r.first_monthly_score,
            r.second_monthly_score,
            r.midterm_exam_score,
            r.third_monthly_score,
            r.fourth_monthly_score,
            r.final_exam_score,
          ].filter(s => s !== null && s !== undefined && s !== '');
          
          validScores.push(...scores.map(Number));
        });

        const avgScore = validScores.length > 0 
          ? +(validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
          : 0;

        setStats({
          totalAssignments: response.data?.length || 0,
          totalResults: allResults.length,
          avgScore,
        });
      } catch (e) {
        console.log('Could not load results stats');
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon className="w-12 h-12 text-gray-300" />
      </div>
    </div>
  );

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
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.first_name} {user?.last_name}! 👋</h1>
        <p className="text-purple-100 text-lg">
          Manage your subject assignments and student results from this dashboard.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={BookOpen}
          label="Total Assignments"
          value={stats.totalAssignments}
          color="border-indigo-600"
        />
        <StatCard
          icon={Users}
          label="Total Results Entered"
          value={stats.totalResults}
          color="border-green-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Class Score"
          value={stats.avgScore.toFixed(1)}
          color="border-blue-600"
        />
      </div>

      {/* Subject Assignments Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-6 py-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Your Subject Assignments</h2>
          <p className="text-gray-600 text-sm mt-1">Click on an assignment to manage student results</p>
        </div>

        {assignments.length > 0 ? (
          <div className="divide-y">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {assignment.subject_name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <BarChart3 size={16} />
                        {assignment.class_name}
                      </span>
                      <span className="flex items-center gap-1">
                        Grade: {assignment.grade_level}
                      </span>
                      <span className="flex items-center gap-1">
                        Year: {assignment.academic_year}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/teacher/results?class=${assignment.class_id}&subject=${assignment.subject_id}&year=${assignment.academic_year}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap ml-4"
                  >
                    Manage Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <BookOpen size={48} className="mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 text-lg">No assignments found</p>
            <p className="text-gray-400 text-sm mt-2">
              Contact your administrator to assign you to subjects and classes.
            </p>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Quick Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Click "Manage Results" to enter or update student scores</li>
          <li>• All scores must be between 0–100</li>
          <li>• Results are automatically calculated and graded</li>
          <li>• Click Refresh to see the latest data</li>
        </ul>
      </div>
    </div>
  );
};

export default TeacherDashboard;

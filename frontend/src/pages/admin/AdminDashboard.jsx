import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import classesService from '../../services/classesService';
import subjectsService from '../../services/subjectsService';
import teachersService from '../../services/teachersService';
import studentsService from '../../services/studentsService';
import assignmentsService from '../../services/assignmentsService';
import api from '../../services/api';
import { Users, BookOpen, User, Award, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    classes: 0,
    subjects: 0,
    teachers: 0,
    students: 0,
    assignments: 0,
  });
  const [resultStats, setResultStats] = useState({
    totalResults: 0,
    avgScore: 0,
    highestScore: 0,
    lowestScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [cls, subj, teach, stud, assign] = await Promise.all([
        classesService.listClasses(),
        subjectsService.listSubjects(),
        teachersService.listTeachers(),
        studentsService.listStudents(),
        assignmentsService.listAssignments(),
      ]);

      setStats({
        classes: cls.length,
        subjects: subj.length,
        teachers: teach.length,
        students: stud.length,
        assignments: assign.length,
      });

      // Load results statistics
      try {
        const resultsResponse = await api.get('/results');
        const results = resultsResponse.data || [];
        
        let totalResults = results.length;
        let validScores = [];
        
        results.forEach(r => {
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
        const highestScore = validScores.length > 0 ? Math.max(...validScores) : 0;
        const lowestScore = validScores.length > 0 ? Math.min(...validScores) : 0;

        setResultStats({
          totalResults,
          avgScore,
          highestScore,
          lowestScore,
        });
      } catch (e) {
        console.log('Could not load results stats');
      }

      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, onClick, trend }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-t-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && <p className="text-xs text-green-600 mt-1">↑ {trend}</p>}
        </div>
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.first_name}! 👋</h1>
        <p className="text-indigo-100 text-lg">
          You're logged in as an Administrator. Manage all aspects of the school system from this dashboard.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Statistics Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            icon={BookOpen}
            label="Classes"
            value={stats.classes}
            color="border-blue-500"
            onClick={() => navigate('/admin/classes')}
          />
          <StatCard
            icon={Award}
            label="Subjects"
            value={stats.subjects}
            color="border-green-500"
            onClick={() => navigate('/admin/subjects')}
          />
          <StatCard
            icon={Users}
            label="Teachers"
            value={stats.teachers}
            color="border-purple-500"
            onClick={() => navigate('/admin/teachers')}
          />
          <StatCard
            icon={User}
            label="Students"
            value={stats.students}
            color="border-orange-500"
            onClick={() => navigate('/admin/students')}
          />
          <StatCard
            icon={BarChart3}
            label="Assignments"
            value={stats.assignments}
            color="border-red-500"
            onClick={() => navigate('/admin/assignments')}
          />
        </div>
      </div>

      {/* Results Statistics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Results Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Results</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{resultStats.totalResults}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-indigo-300" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{resultStats.avgScore.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-300" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Highest Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{resultStats.highestScore}</p>
              </div>
              <Award className="w-12 h-12 text-blue-300" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Lowest Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{resultStats.lowestScore}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/classes')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            📚 Manage Classes
          </button>
          <button
            onClick={() => navigate('/admin/subjects')}
            className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            🎓 Manage Subjects
          </button>
          <button
            onClick={() => navigate('/admin/teachers')}
            className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            👨‍🏫 Manage Teachers
          </button>
          <button
            onClick={() => navigate('/admin/students')}
            className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            👨‍🎓 Manage Students
          </button>
          <button
            onClick={() => navigate('/admin/assignments')}
            className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            📋 Manage Assignments
          </button>
          <button
            onClick={loadStats}
            className="bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            🔄 Refresh Statistics
          </button>
        </div>
      </div>

      {/* Information Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">System Features</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 font-bold mr-3 mt-0.5">✓</span>
              <span>Manage classes and academic years</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 font-bold mr-3 mt-0.5">✓</span>
              <span>Create and organize subjects</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 font-bold mr-3 mt-0.5">✓</span>
              <span>Register teachers with specializations</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 font-bold mr-3 mt-0.5">✓</span>
              <span>Enroll students in classes</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 font-bold mr-3 mt-0.5">✓</span>
              <span>Assign teachers to classes and subjects</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 font-bold mr-3 mt-0.5">✓</span>
              <span>Track and analyze student results</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Privileges</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-indigo-500 font-bold mr-3 mt-0.5">📋</span>
              <span>Full access to all management features</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 font-bold mr-3 mt-0.5">👥</span>
              <span>Create and modify user accounts</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 font-bold mr-3 mt-0.5">📊</span>
              <span>View system-wide statistics and results</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 font-bold mr-3 mt-0.5">⚙️</span>
              <span>Configure classes and academic setup</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 font-bold mr-3 mt-0.5">🔑</span>
              <span>Manage access control and roles</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 font-bold mr-3 mt-0.5">📈</span>
              <span>Generate reports and analytics</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

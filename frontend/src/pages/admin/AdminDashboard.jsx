import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import classesService from '../../services/classesService';
import subjectsService from '../../services/subjectsService';
import teachersService from '../../services/teachersService';
import studentsService from '../../services/studentsService';
import assignmentsService from '../../services/assignmentsService';
import api from '../../services/api';
import { 
  Users, BookOpen, User, Award, BarChart3, TrendingUp, AlertCircle, 
  ChevronRight, RefreshCw, GraduationCap, Calendar, Activity, 
  ArrowUpRight, Sparkles, Clock, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

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
  const [chartData, setChartData] = useState([]);
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

      // Calculate students per class for chart
      const studentsPerClass = cls.map(c => ({
        name: c.name,
        students: stud.filter(s => s.class_id === c.id).length
      })).sort((a, b) => b.students - a.students);
      
      setChartData(studentsPerClass);

      // Load results statistics
      try {
        const resultsResponse = await api.get('/results');
        const results = resultsResponse.data.data || resultsResponse.data || [];
        
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
      } catch (error) {
        console.log('Could not load results stats', error);
      }

      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Modern stat card with gradient and hover effects
  const StatCard = ({ icon: Icon, label, value, gradient, onClick, trend, trendLabel }) => (
    <Card 
      onClick={onClick}
      className="group cursor-pointer overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-800/50 transition-all duration-500 hover:-translate-y-1"
    >
      <CardContent className="p-6 relative">
        {/* Background gradient decoration */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 blur-2xl rounded-full transform translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity duration-500`} />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${gradient} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {trend && (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-semibold">
                <TrendingUp size={12} />
                <span>{trend}</span>
              </div>
            )}
          </div>
          
          <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {value}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
          
          {trendLabel && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{trendLabel}</p>
          )}
        </div>
        
        {/* Hover arrow */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowUpRight className="w-5 h-5 text-indigo-500" />
        </div>
      </CardContent>
    </Card>
  );

  // Performance metric card
  const MetricCard = ({ icon: Icon, label, value, color, suffix = '' }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}{suffix}</p>
      </div>
    </div>
  );

  // Quick action button
  const QuickAction = ({ icon: Icon, label, description, onClick, color }) => (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-transparent hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 text-left"
    >
      <div className={`p-3 rounded-xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-white truncate">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
    </button>
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 lg:p-10">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                <Calendar size={16} />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {greeting}, {user?.first_name}! 👋
              </h1>
              <p className="text-white/80 text-lg max-w-xl">
                Here&apos;s your school overview. Manage classes, track performance, and ensure academic excellence.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={loadStats} 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm gap-2"
              >
                <RefreshCw size={16} />
                Refresh Data
              </Button>
              <Button 
                onClick={() => navigate('/admin/students')} 
                className="bg-white hover:bg-white/90 text-indigo-600 border-0 gap-2 shadow-lg"
              >
                <User size={16} />
                Add Student
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Overview</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time statistics of your school</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={BookOpen}
            label="Total Classes"
            value={stats.classes}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            onClick={() => navigate('/admin/classes')}
            trendLabel="Click to manage"
          />
          <StatCard
            icon={Award}
            label="Subjects"
            value={stats.subjects}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            onClick={() => navigate('/admin/subjects')}
            trendLabel="Click to manage"
          />
          <StatCard
            icon={Users}
            label="Teachers"
            value={stats.teachers}
            gradient="bg-gradient-to-br from-violet-500 to-violet-600"
            onClick={() => navigate('/admin/teachers')}
            trendLabel="Click to manage"
          />
          <StatCard
            icon={User}
            label="Students"
            value={stats.students}
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
            onClick={() => navigate('/admin/students')}
            trendLabel="Click to manage"
          />
          <StatCard
            icon={BarChart3}
            label="Assignments"
            value={stats.assignments}
            gradient="bg-gradient-to-br from-rose-500 to-pink-500"
            onClick={() => navigate('/admin/assignments')}
            trendLabel="Click to manage"
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Charts & Performance */}
        <div className="xl:col-span-2 space-y-8">
          {/* Academic Performance */}
          <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white dark:bg-slate-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Academic Performance</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overall grade statistics</p>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                  <Activity size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={BarChart3}
                  label="Total Results"
                  value={resultStats.totalResults}
                  color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                />
                <MetricCard
                  icon={Target}
                  label="Average Score"
                  value={resultStats.avgScore.toFixed(1)}
                  suffix="%"
                  color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                />
                <MetricCard
                  icon={TrendingUp}
                  label="Highest Score"
                  value={resultStats.highestScore}
                  suffix="%"
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <MetricCard
                  icon={AlertCircle}
                  label="Lowest Score"
                  value={resultStats.lowestScore}
                  suffix="%"
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white dark:bg-slate-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Student Distribution</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Students enrolled per class</p>
                </div>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10">
                  <GraduationCap size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[320px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="students" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorStudents)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Quick Actions</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Shortcuts to common tasks</p>
          </div>
          
          <div className="space-y-3">
            <QuickAction
              icon={User}
              label="Add New Student"
              description="Register a new student"
              onClick={() => navigate('/admin/students')}
              color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            />
            <QuickAction
              icon={Users}
              label="Manage Teachers"
              description="View and edit teacher profiles"
              onClick={() => navigate('/admin/teachers')}
              color="bg-gradient-to-br from-violet-500 to-violet-600"
            />
            <QuickAction
              icon={BookOpen}
              label="Class Schedule"
              description="Organize class timetables"
              onClick={() => navigate('/admin/classes')}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <QuickAction
              icon={Award}
              label="Manage Subjects"
              description="Add or edit subjects"
              onClick={() => navigate('/admin/subjects')}
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
            <QuickAction
              icon={BarChart3}
              label="Review Assignments"
              description="Check teacher assignments"
              onClick={() => navigate('/admin/assignments')}
              color="bg-gradient-to-br from-rose-500 to-pink-500"
            />
          </div>

          {/* Info Card */}
          <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20">
                  <Sparkles size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Pro Tip</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Click on any stat card to quickly navigate to its management page. Use the refresh button to get real-time updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

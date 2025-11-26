import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  BookOpen, Users, TrendingUp, BarChart3, ArrowRight, Calendar,
  GraduationCap, Clock, Target, Sparkles, ChevronRight, Activity,
  Award, FileText, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      } catch (error) {
        console.log('Could not load results stats', error);
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Modern stat card with gradient
  const StatCard = ({ icon: Icon, label, value, gradient, suffix = '' }) => (
    <Card className="group overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl transition-all duration-500">
      <CardContent className="p-6 relative">
        <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 blur-2xl rounded-full transform translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity duration-500`} />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${gradient} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
            {value}{suffix}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  // Assignment card component
  const AssignmentCard = ({ assignment }) => (
    <Card className="group overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Left color accent */}
          <div className="lg:w-1.5 h-1.5 lg:h-auto bg-gradient-to-b from-violet-500 to-purple-600" />
          
          <div className="flex-1 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                {/* Subject name with icon */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 border border-violet-100 dark:border-violet-800 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen size={20} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {assignment.subject_name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Subject Assignment</p>
                  </div>
                </div>

                {/* Info badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                    <Users size={12} />
                    {assignment.class_name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                    <GraduationCap size={12} />
                    Grade {assignment.grade_level}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-medium">
                    <Calendar size={12} />
                    {assignment.academic_year}
                  </span>
                </div>
              </div>

              {/* Action button */}
              <Button 
                asChild 
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/25 gap-2 group/btn"
              >
                <Link to={`/teacher/results?class=${assignment.class_id}&subject=${assignment.subject_id}&year=${assignment.academic_year}`}>
                  <FileText size={16} />
                  <span>Manage Results</span>
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-100 dark:border-violet-900 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-violet-600 rounded-full border-t-transparent animate-spin" />
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 lg:p-10">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
        
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
                Manage your classes, enter grades, and track student performance all in one place.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <span className="text-white text-sm font-medium">{assignments.length} Active Classes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <Activity size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Teaching Overview</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Your performance metrics</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={BookOpen}
            label="Total Assignments"
            value={stats.totalAssignments}
            gradient="bg-gradient-to-br from-violet-500 to-violet-600"
          />
          <StatCard
            icon={Users}
            label="Total Results Entered"
            value={stats.totalResults}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={Target}
            label="Average Class Score"
            value={stats.avgScore.toFixed(1)}
            suffix="%"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
        </div>
      </div>

      {/* Assignments Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Assignments</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Select a class to manage student results</p>
          </div>
        </div>

        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Assignments Found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                You haven&apos;t been assigned to any classes yet. Please contact the administrator to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Tips Section */}
      <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/20">
              <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Tips</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Make the most of your teaching dashboard</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: FileText, text: 'Click "Manage Results" to enter or update student scores' },
              { icon: Target, text: 'All scores must be between 0–100' },
              { icon: Activity, text: 'Results are automatically calculated and graded' },
              { icon: Clock, text: 'Check back regularly for updated class assignments' },
            ].map((tip, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-blue-100 dark:border-blue-800/50"
              >
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                  <tip.icon size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{tip.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;

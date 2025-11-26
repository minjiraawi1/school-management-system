import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { 
  BookOpen, BarChart3, Award, TrendingUp, AlertCircle, ArrowRight,
  GraduationCap, Calendar, Trophy, Target, Sparkles, Star, 
  CheckCircle2, Clock, Zap
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Calculate grade from score
  const calculateGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };
  const [stats, setStats] = useState({
    subjects: 0,
    classInfo: null,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        console.log('User not authenticated');
        return;
      }

      let classInfo = {
        name: 'N/A',
        gradeLevel: 'N/A',
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      };

      // Get current student's profile info (class details)
      try {
        const studentResponse = await api.get(`/students/me`);
        if (studentResponse.data?.success && studentResponse.data?.data) {
          const studentData = studentResponse.data.data;
          classInfo = {
            name: studentData.class_name || 'N/A',
            gradeLevel: studentData.grade_level || 'N/A',
            academicYear: studentData.academic_year || classInfo.academicYear,
          };
        }
      } catch (error) {
        console.log('Could not load student profile, using defaults:', error.message);
      }

      // Get student results for current academic year
      try {
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;
        
        const resultsResponse = await api.get(`/results/student/me/${academicYear}`);
        const responseData = resultsResponse.data?.data || resultsResponse.data || {};
        
        // Update stats with class info and subject count
        setStats(prev => ({
          ...prev,
          classInfo,
          subjects: responseData.subjects?.length || 0,
        }));

        // Map results to the format expected by ResultCard
        const formattedResults = responseData.subjects?.map(subject => ({
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
          final_score: subject.annual_total,
          grade: calculateGrade(subject.annual_total),
        })) || [];

        setResults(formattedResults);
      } catch (error) {
        console.error('Could not load results:', error);
        // Set empty results but don't fail the dashboard
        setResults([]);
        setStats(prev => ({
          ...prev,
          classInfo,
          subjects: 0,
        }));
      }
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Modern stat card
  const StatCard = ({ icon: Icon, label, value, gradient }) => (
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
            {value}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  // Result card with grade visualization
  const ResultCard = ({ subject, score, grade }) => {
    const gradeConfig = {
      'A': { 
        gradient: 'from-emerald-500 to-emerald-600', 
        bg: 'bg-emerald-50 dark:bg-emerald-500/10', 
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        icon: Trophy
      },
      'B': { 
        gradient: 'from-blue-500 to-blue-600', 
        bg: 'bg-blue-50 dark:bg-blue-500/10', 
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        icon: Star
      },
      'C': { 
        gradient: 'from-amber-500 to-amber-600', 
        bg: 'bg-amber-50 dark:bg-amber-500/10', 
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        icon: Target
      },
      'D': { 
        gradient: 'from-orange-500 to-orange-600', 
        bg: 'bg-orange-50 dark:bg-orange-500/10', 
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        icon: Clock
      },
      'F': { 
        gradient: 'from-red-500 to-red-600', 
        bg: 'bg-red-50 dark:bg-red-500/10', 
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        icon: AlertCircle
      },
    };

    const config = gradeConfig[grade] || gradeConfig['C'];
    const GradeIcon = config.icon;
    const numericScore = typeof score === 'number' ? score : 0;

    return (
      <Card className="group overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <BookOpen size={18} className="text-white" />
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${config.text} border ${config.border}`}>
              <GradeIcon size={14} />
              <span className="font-bold text-sm">Grade {grade}</span>
            </div>
          </div>
          
          {/* Subject name */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 line-clamp-1">{subject}</h3>
          
          {/* Score visualization */}
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Final Score</span>
              <span className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                {score}%
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-1000`}
                style={{ width: `${numericScore}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-100 dark:border-emerald-900 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Calculate overall average
  const overallAverage = results.length > 0 
    ? (results.reduce((sum, r) => sum + (r.final_score || 0), 0) / results.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 lg:p-10">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                <Calendar size={16} />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {greeting}, {user?.first_name}! 🎓
              </h1>
              <p className="text-white/80 text-lg max-w-xl">
                Track your academic journey and stay on top of your grades. Keep pushing forward!
              </p>
            </div>
            
            {/* Class Info Cards */}
            {stats.classInfo && (
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20">
                  <p className="text-xs text-white/70 uppercase tracking-wider font-semibold mb-0.5">Grade Level</p>
                  <p className="font-bold text-white text-lg">{stats.classInfo.gradeLevel}</p>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20">
                  <p className="text-xs text-white/70 uppercase tracking-wider font-semibold mb-0.5">Class</p>
                  <p className="font-bold text-white text-lg">{stats.classInfo.name}</p>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20">
                  <p className="text-xs text-white/70 uppercase tracking-wider font-semibold mb-0.5">Year</p>
                  <p className="font-bold text-white text-lg">{stats.classInfo.academicYear}</p>
                </div>
              </div>
            )}
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

      {/* Statistics */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Overview</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Your academic snapshot</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={BookOpen}
            label="Enrolled Subjects"
            value={stats.subjects}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={BarChart3}
            label="Results Posted"
            value={results.length}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={Target}
            label="Overall Average"
            value={`${overallAverage}%`}
            gradient="bg-gradient-to-br from-violet-500 to-violet-600"
          />
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Results</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Performance by subject</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/student/results')} 
            className="gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
          >
            View All Results
            <ArrowRight size={16} />
          </Button>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.slice(0, 6).map((result, idx) => (
              <ResultCard
                key={idx}
                subject={result.subject_name || result.subject_id}
                score={result.final_score || 0}
                grade={result.grade || 'N/A'}
              />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Results Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Your results will appear here as soon as your teachers publish them. Keep working hard!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grading System */}
        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                <GraduationCap size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grading System</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">How your grades are calculated</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { grade: 'A', range: '90-100%', color: 'emerald' },
                { grade: 'B', range: '80-89%', color: 'blue' },
                { grade: 'C', range: '70-79%', color: 'amber' },
                { grade: 'D', range: '60-69%', color: 'orange' },
                { grade: 'F', range: '0-59%', color: 'red' },
              ].map((item) => (
                <div 
                  key={item.grade} 
                  className={`flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-${item.color}-100 dark:border-${item.color}-800/50`}
                >
                  <span className={`font-bold text-${item.color}-600 dark:text-${item.color}-400`}>Grade {item.grade}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item.range}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Tips */}
        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                <Sparkles size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Performance Tips</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Strategies for success</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { icon: CheckCircle2, text: 'Check your results regularly to track progress' },
                { icon: Target, text: 'Review areas where you scored lower for improvement' },
                { icon: Zap, text: 'Set goals and work towards achieving higher grades' },
                { icon: TrendingUp, text: 'Your final score is the average of Term 1 and Term 2' },
              ].map((tip, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-emerald-100 dark:border-emerald-800/50"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <tip.icon size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{tip.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;

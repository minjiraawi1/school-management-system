import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  BarChart3, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Target,
  GraduationCap,
  Calculator,
  Award
} from 'lucide-react';

// Constants for score calculations
const MAX_TERM_SCORE = 100; // Maximum score per term
const MAX_ANNUAL_SCORE = 200; // Maximum total score (Term 1 + Term 2)

const StudentResultsView = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [years, setYears] = useState([]);

  useEffect(() => {
    loadAvailableYears();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedYear !== 'all') {
      loadResults(selectedYear);
    }
  }, [selectedYear]);

  const loadAvailableYears = async () => {
    try {
      setLoading(true);
      setError(null);

      const yearsResponse = await api.get('/results/student/me/years');
      const availableYears = yearsResponse.data?.data || [];
      
      if (availableYears.length > 0) {
        setYears(availableYears);
        setSelectedYear(availableYears[0]);
      } else {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        let academicYear = currentMonth < 7 
          ? `${currentYear - 1}-${currentYear}`
          : `${currentYear}-${currentYear + 1}`;
        
        setYears([academicYear]);
        setSelectedYear(academicYear);
      }
    } catch (err) {
      console.error('Error loading available years:', err);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      let academicYear = currentMonth < 7 
        ? `${currentYear - 1}-${currentYear}`
        : `${currentYear}-${currentYear + 1}`;
      
      setYears([academicYear]);
      setSelectedYear(academicYear);
    }
  };

  const loadResults = async (year) => {
    try {
      setLoading(true);
      setError(null);
      
      const resultsResponse = await api.get(`/results/student/me/${year}`);
      
      let data = resultsResponse.data;
      if (data && typeof data === 'object') {
        data = data.data || data;
      } else {
        data = {};
      }
      
      // Store full summary data from API
      setSummaryData({
        term_1_grand_total: data.term_1_grand_total || 0,
        term_2_grand_total: data.term_2_grand_total || 0,
        annual_grand_total: data.annual_grand_total || 0,
        annual_average: data.annual_average || 0,
      });
      
      const studentResults = Array.isArray(data.subjects) ? data.subjects : [];
      setResults(studentResults);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load results';
      setError(errorMsg);
      console.error('Error loading results:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage from score (score out of max)
  const calculatePercentage = (score, maxScore = MAX_TERM_SCORE) => {
    if (!score || maxScore === 0) return 0;
    return ((score / maxScore) * 100).toFixed(1);
  };

  // Get grade based on percentage
  const getGrade = (percentage) => {
    const pct = parseFloat(percentage);
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    return 'F';
  };

  // Grade styling
  const getGradeStyle = (grade) => {
    const styles = {
      'A': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'B': 'bg-blue-100 text-blue-800 border-blue-300',
      'C': 'bg-amber-100 text-amber-800 border-amber-300',
      'D': 'bg-orange-100 text-orange-800 border-orange-300',
      'F': 'bg-red-100 text-red-800 border-red-300',
    };
    return styles[grade] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Get performance level text
  const getPerformanceLevel = (percentage) => {
    const pct = parseFloat(percentage);
    if (pct >= 90) return { text: 'Excellent', color: 'text-emerald-600' };
    if (pct >= 80) return { text: 'Very Good', color: 'text-blue-600' };
    if (pct >= 70) return { text: 'Good', color: 'text-amber-600' };
    if (pct >= 60) return { text: 'Satisfactory', color: 'text-orange-600' };
    return { text: 'Needs Improvement', color: 'text-red-600' };
  };

  // Calculate overall statistics
  const calculateStats = () => {
    if (results.length === 0) {
      return { avgPercentage: 0, highestPct: 0, lowestPct: 0, passedCount: 0, totalSubjects: 0 };
    }

    const percentages = results.map(r => {
      const annualTotal = r.annual_total || (r.term_1_total || 0) + (r.term_2_total || 0);
      return parseFloat(calculatePercentage(annualTotal, MAX_ANNUAL_SCORE));
    });

    const avgPercentage = (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(1);
    const highestPct = Math.max(...percentages).toFixed(1);
    const lowestPct = Math.min(...percentages).toFixed(1);
    const passedCount = percentages.filter(p => p >= 60).length;

    return { avgPercentage, highestPct, lowestPct, passedCount, totalSubjects: results.length };
  };

  const stats = calculateStats();
  const overallPerformance = getPerformanceLevel(stats.avgPercentage);
  const overallGrade = getGrade(stats.avgPercentage);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Loading your results...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          className="w-fit pl-0 hover:pl-2 transition-all"
          onClick={() => navigate('/student/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              Academic Results
            </h1>
            <p className="text-muted-foreground mt-1">Track your academic progress and performance</p>
          </div>
          
          {/* Year Selector */}
          <Card className="w-full md:w-auto">
            <CardContent className="p-4 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-sm whitespace-nowrap">Academic Year:</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Message */}
      {error && error !== 'No results available' && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* Results Content */}
      {results.length > 0 ? (
        <div className="space-y-6">
          {/* Performance Overview Card */}
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-primary" />
                Overall Performance
              </CardTitle>
              <CardDescription>Your academic standing for {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Score Display */}
                <div className="flex flex-col items-center justify-center p-6 bg-background rounded-xl border">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl font-bold text-primary">{stats.avgPercentage}</span>
                        <span className="text-xl text-primary">%</span>
                      </div>
                    </div>
                    <Badge className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-lg px-4 py-1 ${getGradeStyle(overallGrade)}`}>
                      Grade {overallGrade}
                    </Badge>
                  </div>
                  <p className={`mt-6 font-semibold ${overallPerformance.color}`}>
                    {overallPerformance.text}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Highest Score</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">{stats.highestPct}%</p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                      <Target className="h-4 w-4" />
                      <span className="text-sm font-medium">Lowest Score</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-700">{stats.lowestPct}%</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm font-medium">Total Subjects</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">{stats.totalSubjects}</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <Award className="h-4 w-4" />
                      <span className="text-sm font-medium">Passed Subjects</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-700">
                      {stats.passedCount}/{stats.totalSubjects}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Term Summaries */}
          {summaryData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-indigo-50/50 border-indigo-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-semibold text-indigo-800">Term 1 Summary</h3>
                    </div>
                    <Badge variant="outline" className="border-indigo-300 text-indigo-700">
                      {calculatePercentage(summaryData.term_1_grand_total, MAX_TERM_SCORE * results.length)}%
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-indigo-700">{summaryData.term_1_grand_total}</p>
                  <p className="text-sm text-indigo-600 mt-1">
                    out of {MAX_TERM_SCORE * results.length} total marks
                  </p>
                  <Progress 
                    value={parseFloat(calculatePercentage(summaryData.term_1_grand_total, MAX_TERM_SCORE * results.length))} 
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-violet-50/50 border-violet-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-violet-600" />
                      <h3 className="font-semibold text-violet-800">Term 2 Summary</h3>
                    </div>
                    <Badge variant="outline" className="border-violet-300 text-violet-700">
                      {calculatePercentage(summaryData.term_2_grand_total, MAX_TERM_SCORE * results.length)}%
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-violet-700">{summaryData.term_2_grand_total}</p>
                  <p className="text-sm text-violet-600 mt-1">
                    out of {MAX_TERM_SCORE * results.length} total marks
                  </p>
                  <Progress 
                    value={parseFloat(calculatePercentage(summaryData.term_2_grand_total, MAX_TERM_SCORE * results.length))} 
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Subject-wise Results
              </CardTitle>
              <CardDescription>Detailed breakdown of your performance in each subject</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold">Subject</TableHead>
                      <TableHead colSpan={3} className="text-center bg-indigo-50/50 border-x">
                        <span className="text-indigo-700 font-semibold">Term 1</span>
                      </TableHead>
                      <TableHead colSpan={3} className="text-center bg-violet-50/50 border-x">
                        <span className="text-violet-700 font-semibold">Term 2</span>
                      </TableHead>
                      <TableHead className="text-center bg-primary/5">
                        <span className="text-primary font-semibold">Annual</span>
                      </TableHead>
                      <TableHead className="text-center bg-primary/5">
                        <span className="text-primary font-semibold">%</span>
                      </TableHead>
                      <TableHead className="text-center bg-primary/5">
                        <span className="text-primary font-semibold">Grade</span>
                      </TableHead>
                    </TableRow>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead></TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground bg-indigo-50/30">1st Monthly</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground bg-indigo-50/30">2nd Monthly</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground bg-indigo-50/30 border-r">Midterm</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground bg-violet-50/30">3rd Monthly</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground bg-violet-50/30">4th Monthly</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground bg-violet-50/30 border-r">Final</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground bg-primary/5">Total</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground bg-primary/5">Percentage</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, idx) => {
                      const term1Total = result.term_1_total || 0;
                      const term2Total = result.term_2_total || 0;
                      const annualTotal = result.annual_total || (term1Total + term2Total);
                      const percentage = calculatePercentage(annualTotal, MAX_ANNUAL_SCORE);
                      const grade = getGrade(percentage);

                      return (
                        <TableRow key={idx} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="min-w-[150px]">
                              <p className="font-semibold">{result.subject_name}</p>
                              <p className="text-xs text-muted-foreground">{result.subject_code}</p>
                            </div>
                          </TableCell>
                          {/* Term 1 Scores */}
                          <TableCell className="text-center bg-indigo-50/10">
                            {result.scores?.first_monthly_score ?? '-'}
                          </TableCell>
                          <TableCell className="text-center bg-indigo-50/10">
                            {result.scores?.second_monthly_score ?? '-'}
                          </TableCell>
                          <TableCell className="text-center bg-indigo-50/10 border-r font-medium text-indigo-700">
                            {result.scores?.midterm_exam_score ?? '-'}
                            <div className="text-xs text-indigo-600 font-normal">= {term1Total}</div>
                          </TableCell>
                          {/* Term 2 Scores */}
                          <TableCell className="text-center bg-violet-50/10">
                            {result.scores?.third_monthly_score ?? '-'}
                          </TableCell>
                          <TableCell className="text-center bg-violet-50/10">
                            {result.scores?.fourth_monthly_score ?? '-'}
                          </TableCell>
                          <TableCell className="text-center bg-violet-50/10 border-r font-medium text-violet-700">
                            {result.scores?.final_exam_score ?? '-'}
                            <div className="text-xs text-violet-600 font-normal">= {term2Total}</div>
                          </TableCell>
                          {/* Annual Summary */}
                          <TableCell className="text-center bg-primary/5 font-bold text-lg">
                            {annualTotal}
                          </TableCell>
                          <TableCell className="text-center bg-primary/5">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-lg text-primary">{percentage}%</span>
                              <Progress value={parseFloat(percentage)} className="w-16 h-1.5 mt-1" />
                            </div>
                          </TableCell>
                          <TableCell className="text-center bg-primary/5">
                            <Badge className={`text-sm font-bold ${getGradeStyle(grade)}`}>
                              {grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* Total Row */}
                    <TableRow className="bg-muted/70 font-semibold hover:bg-muted/70">
                      <TableCell className="font-bold">Grand Total</TableCell>
                      <TableCell colSpan={3} className="text-center border-r bg-indigo-100/50">
                        <span className="text-indigo-800 font-bold text-lg">
                          {summaryData?.term_1_grand_total || 0}
                        </span>
                        <span className="text-indigo-600 text-sm ml-1">
                          / {MAX_TERM_SCORE * results.length}
                        </span>
                      </TableCell>
                      <TableCell colSpan={3} className="text-center border-r bg-violet-100/50">
                        <span className="text-violet-800 font-bold text-lg">
                          {summaryData?.term_2_grand_total || 0}
                        </span>
                        <span className="text-violet-600 text-sm ml-1">
                          / {MAX_TERM_SCORE * results.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-center bg-primary/10">
                        <span className="text-primary font-bold text-lg">
                          {summaryData?.annual_grand_total || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center bg-primary/10">
                        <span className="text-primary font-bold text-lg">
                          {stats.avgPercentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center bg-primary/10">
                        <Badge className={`text-sm font-bold ${getGradeStyle(overallGrade)}`}>
                          {overallGrade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Grading Scale Legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Grading Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { grade: 'A', range: '90-100%', color: 'emerald', label: 'Excellent' },
                  { grade: 'B', range: '80-89%', color: 'blue', label: 'Very Good' },
                  { grade: 'C', range: '70-79%', color: 'amber', label: 'Good' },
                  { grade: 'D', range: '60-69%', color: 'orange', label: 'Satisfactory' },
                  { grade: 'F', range: '0-59%', color: 'red', label: 'Fail' },
                ].map(({ grade, range, color, label }) => (
                  <div 
                    key={grade} 
                    className={`flex items-center gap-3 p-3 rounded-lg border bg-${color}-50/50 border-${color}-200`}
                  >
                    <Badge className={`bg-${color}-100 text-${color}-800 border-${color}-300 text-lg px-3 py-1`}>
                      {grade}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{range}</p>
                      <p className={`text-xs text-${color}-600`}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Empty State */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <BarChart3 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Results Available</h3>
            <p className="text-muted-foreground max-w-sm">
              {selectedYear 
                ? `No approved results found for the academic year ${selectedYear}.` 
                : 'Your results will appear here once teachers submit and admins approve them.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentResultsView;

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, RefreshCw, Save } from 'lucide-react';

const TeacherResultsManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const classId = params.get('class');
  const subjectId = params.get('subject');
  const year = params.get('year');

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/results/class/${classId}/subject/${subjectId}/${year}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRows(data);
      const map = {};
      data.forEach(r => {
        const id = r.student_id;
        if (!id) return;
        map[id] = {
          first_monthly_score: r.first_monthly_score ?? '',
          second_monthly_score: r.second_monthly_score ?? '',
          midterm_exam_score: r.midterm_exam_score ?? '',
          final_exam_score: r.final_exam_score ?? ''
        };
      });
      setForm(map);
    } catch (error) {
      console.error('Error loading results:', error);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [classId, subjectId, year]);

  useEffect(() => {
    if (classId && subjectId && year) fetchData();
  }, [fetchData, classId, subjectId, year]);

  const handleChange = (sid, key, val) => {
    setForm(prev => ({
      ...prev,
      [sid]: {
        ...(prev[sid] || {}),
        [key]: val
      }
    }));
  };

  const valid = useMemo(() => {
    for (const sid in form) {
      const r = form[sid];
      
      // Validate Monthly 1
      if (r.first_monthly_score !== '' && r.first_monthly_score !== null) {
        const n = parseFloat(r.first_monthly_score);
        if (Number.isNaN(n) || n < 0 || n > 20) return false;
      }

      // Validate Monthly 2
      if (r.second_monthly_score !== '' && r.second_monthly_score !== null) {
        const n = parseFloat(r.second_monthly_score);
        if (Number.isNaN(n) || n < 0 || n > 20) return false;
      }

      // Validate Midterm
      if (r.midterm_exam_score !== '' && r.midterm_exam_score !== null) {
        const n = parseFloat(r.midterm_exam_score);
        if (Number.isNaN(n) || n < 0 || n > 80) return false;
      }

      // Validate Final
      if (r.final_exam_score !== '' && r.final_exam_score !== null) {
        const n = parseFloat(r.final_exam_score);
        if (Number.isNaN(n) || n < 0 || n > 80) return false;
      }
    }
    return true;
  }, [form]);

  const calculateTerm1 = (sid) => {
    const r = form[sid] || {};
    const a = parseFloat(r.first_monthly_score || 0) || 0;
    const c = parseFloat(r.midterm_exam_score || 0) || 0;
    return +(a + c).toFixed(2);
  };

  const calculateTerm2 = (sid) => {
    const r = form[sid] || {};
    const b = parseFloat(r.second_monthly_score || 0) || 0;
    const d = parseFloat(r.final_exam_score || 0) || 0;
    return +(b + d).toFixed(2);
  };

  const calculateFinalScore = (sid) => {
    const term1 = calculateTerm1(sid);
    const term2 = calculateTerm2(sid);
    return +((term1 + term2) / 2).toFixed(2);
  };

  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { grade: 'B', color: 'bg-blue-100 text-blue-800' };
    if (score >= 70) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 60) return { grade: 'D', color: 'bg-orange-100 text-orange-800' };
    return { grade: 'F', color: 'bg-red-100 text-red-800' };
  };

  const saveAll = async () => {
    if (!valid) {
      setError('Scores invalid: Monthly max 20, Exams max 80');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payloads = rows
        .map(r => {
          const sid = r.student_id;
          const f = form[sid] || {};
          return sid
            ? {
                student_id: sid,
                subject_id: Number(subjectId),
                academic_year: String(year),
                first_monthly_score: f.first_monthly_score ?? null,
                second_monthly_score: f.second_monthly_score ?? null,
                midterm_exam_score: f.midterm_exam_score ?? null,
                final_exam_score: f.final_exam_score ?? null
              }
            : null;
        })
        .filter(Boolean);
      for (const p of payloads) {
        await api.post('/results', p);
      }
      setSuccess('All results saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch (error) {
      console.error(error);
      setError('Failed to save results. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[95%] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2 pl-0 hover:pl-2 transition-all"
            onClick={() => navigate('/teacher/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Manage Results</h1>
          <p className="text-muted-foreground">Academic Year: <span className="font-semibold text-foreground">{year}</span></p>
        </div>
        
        {/* Alerts */}
        {(error || success) && (
          <div className={`px-4 py-2 rounded-md text-sm font-medium ${
            error ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-800'
          }`}>
            {error || success}
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Student Results</CardTitle>
            <CardDescription>Enter marks for Term 1 and Term 2</CardDescription>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={saveAll} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save All Results'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px]">Student Name</TableHead>
                  {/* Term 1 Scores */}
                  <TableHead className="text-center bg-blue-50/50 text-blue-900">Monthly 1</TableHead>
                  <TableHead className="text-center bg-blue-50/50 text-blue-900">Midterm</TableHead>
                  <TableHead className="text-center bg-blue-50/50 text-blue-900">Monthly 2</TableHead>
                  {/* Term 2 Scores */}
                  <TableHead className="text-center bg-green-50/50 text-green-900">Final Term</TableHead>
                  {/* Calculated Results */}
                  <TableHead className="text-center bg-indigo-50/50 text-indigo-900 font-semibold">Term 1 Score</TableHead>
                  <TableHead className="text-center bg-indigo-50/50 text-indigo-900 font-semibold">Term 2 Score</TableHead>
                  <TableHead className="text-center bg-purple-50/50 text-purple-900 font-bold">Final Score</TableHead>
                  <TableHead className="text-center bg-purple-50/50 text-purple-900 font-bold">Final %</TableHead>
                  <TableHead className="text-center bg-purple-50/50 text-purple-900 font-bold">Grade</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const sid = r.student_id;
                  const finalScore = calculateFinalScore(sid);
                  const gradeInfo = getGrade(finalScore);
                  return (
                    <TableRow key={sid}>
                      <TableCell className="font-medium">
                        {r.first_name} {r.last_name}
                      </TableCell>
                      {/* Term 1 Inputs */}
                      <TableCell className="text-center bg-blue-50/30 p-2">
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          value={form[sid]?.first_monthly_score ?? ''}
                          onChange={(e) => handleChange(sid, 'first_monthly_score', e.target.value)}
                          className="w-20 text-center mx-auto h-8"
                          placeholder="Max 20"
                        />
                      </TableCell>
                      <TableCell className="text-center bg-blue-50/30 p-2">
                        <Input
                          type="number"
                          min="0"
                          max="80"
                          step="0.1"
                          value={form[sid]?.midterm_exam_score ?? ''}
                          onChange={(e) => handleChange(sid, 'midterm_exam_score', e.target.value)}
                          className="w-20 text-center mx-auto h-8"
                          placeholder="Max 80"
                        />
                      </TableCell>
                      <TableCell className="text-center bg-blue-50/30 p-2">
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          value={form[sid]?.second_monthly_score ?? ''}
                          onChange={(e) => handleChange(sid, 'second_monthly_score', e.target.value)}
                          className="w-20 text-center mx-auto h-8"
                          placeholder="Max 20"
                        />
                      </TableCell>
                      {/* Term 2 Inputs */}
                      <TableCell className="text-center bg-green-50/30 p-2">
                        <Input
                          type="number"
                          min="0"
                          max="80"
                          step="0.1"
                          value={form[sid]?.final_exam_score ?? ''}
                          onChange={(e) => handleChange(sid, 'final_exam_score', e.target.value)}
                          className="w-20 text-center mx-auto h-8"
                          placeholder="Max 80"
                        />
                      </TableCell>
                      {/* Calculated Results */}
                      <TableCell className="text-center font-medium text-indigo-700 bg-indigo-50/30">
                        {calculateTerm1(sid)}
                      </TableCell>
                      <TableCell className="text-center font-medium text-indigo-700 bg-indigo-50/30">
                        {calculateTerm2(sid)}
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-700 bg-purple-50/30 text-lg">
                        {finalScore}
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-700 bg-purple-50/30">
                        {finalScore}%
                      </TableCell>
                      <TableCell className="text-center bg-purple-50/30">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${gradeInfo.color}`}>
                          {gradeInfo.grade}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {r.is_approved ? (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Approved</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      No students found for this assignment
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Grade Scale Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grading Scale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2 p-2 rounded-md border bg-green-50/50">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">A</span>
              <span className="text-sm font-medium">90–100</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md border bg-blue-50/50">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">B</span>
              <span className="text-sm font-medium">80–89</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md border bg-yellow-50/50">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800">C</span>
              <span className="text-sm font-medium">70–79</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md border bg-orange-50/50">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800">D</span>
              <span className="text-sm font-medium">60–69</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md border bg-red-50/50">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">F</span>
              <span className="text-sm font-medium">0–59</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherResultsManagement;
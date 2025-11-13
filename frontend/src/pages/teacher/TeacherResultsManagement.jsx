import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, RefreshCw, Save, ChevronDown } from 'lucide-react';

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
  const [expandedStudents, setExpandedStudents] = useState({});

  const fetchData = async () => {
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
    } catch (e) {
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId && subjectId && year) fetchData();
  }, [classId, subjectId, year]);

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
      for (const k in r) {
        const v = r[k];
        if (v === '' || v === null) continue;
        const n = parseFloat(v);
        if (Number.isNaN(n) || n < 0 || n > 100) return false;
      }
    }
    return true;
  }, [form]);

  const calculateTerm1 = (sid) => {
    const r = form[sid] || {};
    const a = parseFloat(r.first_monthly_score || 0) || 0;
    const b = parseFloat(r.second_monthly_score || 0) || 0;
    const c = parseFloat(r.midterm_exam_score || 0) || 0;
    return +(a + b + c).toFixed(2);
  };

  const calculateTerm2 = (sid) => {
    const r = form[sid] || {};
    const a = parseFloat(r.final_exam_score || 0) || 0;
    return +(a).toFixed(2);
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
      setError('Scores must be between 0–100');
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
    } catch (e) {
      setError('Failed to save results. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Results</h1>
          <p className="text-gray-600 mt-2">Academic Year: <span className="font-semibold">{year}</span></p>
        </div>
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Student Results</h2>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={saveAll}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
            >
              <Save size={18} />
              {saving ? 'Saving…' : 'Save All Results'}
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                {/* Term 1 Scores */}
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 bg-blue-50">Monthly 1</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 bg-blue-50">Midterm</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 bg-blue-50">Monthly 2</th>
                {/* Term 2 Scores */}
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 bg-green-50">Final Term</th>
                {/* Calculated Results */}
                <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-700 bg-indigo-50">Term 1 Score</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-700 bg-indigo-50">Term 2 Score</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700 bg-purple-50">Final Score</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700 bg-purple-50">Final Score %</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700 bg-purple-50">Grade</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const sid = r.student_id;
                const finalScore = calculateFinalScore(sid);
                const gradeInfo = getGrade(finalScore);
                return (
                  <tr key={sid} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {r.first_name} {r.last_name}
                    </td>
                    {/* Term 1 Inputs */}
                    <td className="px-6 py-4 text-center bg-blue-50">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form[sid]?.first_monthly_score ?? ''}
                        onChange={(e) => handleChange(sid, 'first_monthly_score', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0-100"
                      />
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form[sid]?.midterm_exam_score ?? ''}
                        onChange={(e) => handleChange(sid, 'midterm_exam_score', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0-100"
                      />
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form[sid]?.second_monthly_score ?? ''}
                        onChange={(e) => handleChange(sid, 'second_monthly_score', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0-100"
                      />
                    </td>
                    {/* Term 2 Inputs */}
                    <td className="px-6 py-4 text-center bg-green-50">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form[sid]?.final_exam_score ?? ''}
                        onChange={(e) => handleChange(sid, 'final_exam_score', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0-100"
                      />
                    </td>
                    {/* Calculated Results */}
                    <td className="px-6 py-4 text-center font-semibold text-indigo-600 bg-indigo-50">
                      {calculateTerm1(sid)}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-indigo-600 bg-indigo-50">
                      {calculateTerm2(sid)}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-lg text-purple-700 bg-purple-50">
                      {finalScore}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-lg text-purple-700 bg-purple-50">
                      {finalScore}%
                    </td>
                    <td className="px-6 py-4 text-center bg-purple-50">
                      <span className={`px-3 py-1 rounded-full font-bold text-sm ${gradeInfo.color}`}>
                        {gradeInfo.grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No students found for this assignment</p>
            </div>
          )}
        </div>
      </div>

      {/* Grade Scale Legend */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Grading Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-semibold text-sm bg-green-100 text-green-800">A</span>
            <span className="text-sm text-gray-600">90–100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-semibold text-sm bg-blue-100 text-blue-800">B</span>
            <span className="text-sm text-gray-600">80–89</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-semibold text-sm bg-yellow-100 text-yellow-800">C</span>
            <span className="text-sm text-gray-600">70–79</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-semibold text-sm bg-orange-100 text-orange-800">D</span>
            <span className="text-sm text-gray-600">60–69</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-semibold text-sm bg-red-100 text-red-800">F</span>
            <span className="text-sm text-gray-600">0–59</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherResultsManagement;
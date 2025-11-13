import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { ArrowLeft, Download, BarChart3 } from 'lucide-react';

const StudentResultsView = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [years, setYears] = useState([]);

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      setFilteredResults(results.filter(r => r.academic_year === selectedYear));
    } else {
      setFilteredResults(results);
    }
  }, [selectedYear, results]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current year as default (you can change this logic as needed)
      const currentYear = new Date().getFullYear().toString();
      
      const resultsResponse = await api.get(`/results/student/me/${currentYear}`);
      console.log('Results Response:', resultsResponse);
      
      // Handle both wrapped and unwrapped responses
      let data = resultsResponse.data;
      if (data && typeof data === 'object') {
        // If response is wrapped with data property, use it; otherwise use the whole response
        data = data.data || data;
      } else {
        data = {};
      }
      
      // Extract subjects from the normalized response
      const studentResults = Array.isArray(data.subjects) ? data.subjects : [];
      setResults(studentResults);
      setFilteredResults(studentResults);

      // Extract unique academic years - for now just use the current year
      const uniqueYears = [currentYear];
      setYears(uniqueYears);
      if (uniqueYears.length > 0) {
        setSelectedYear(uniqueYears[0]);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load results';
      setError(errorMsg);
      console.error('Full error object:', err);
      console.error('Error loading results:', err.message);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-300';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'F': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPerformanceIndicator = (score) => {
    if (score >= 90) return { text: 'Excellent', color: 'text-green-700' };
    if (score >= 80) return { text: 'Very Good', color: 'text-blue-700' };
    if (score >= 70) return { text: 'Good', color: 'text-yellow-700' };
    if (score >= 60) return { text: 'Satisfactory', color: 'text-orange-700' };
    return { text: 'Needs Improvement', color: 'text-red-700' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Results</h1>
          <p className="text-gray-600 mt-1">View your academic performance across all subjects</p>
        </div>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      {/* Filter and Actions */}
      <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label className="font-semibold text-gray-700">Academic Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message - Only show if there's an actual error (not just no data) */}
      {error && error !== 'No results available' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Results Display */}
      {filteredResults.length > 0 ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(() => {
              const validScores = filteredResults.map(r => r.annual_total).filter(s => s);
              const avg = validScores.length > 0 ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2) : 0;
              const highest = validScores.length > 0 ? Math.max(...validScores) : 0;
              const lowest = validScores.length > 0 ? Math.min(...validScores) : 0;

              return (
                <>
                  <div className="bg-indigo-50 rounded-lg shadow p-4 border-l-4 border-indigo-600">
                    <p className="text-gray-600 text-sm font-medium">Average Score</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">{avg}%</p>
                  </div>
                  <div className="bg-green-50 rounded-lg shadow p-4 border-l-4 border-green-600">
                    <p className="text-gray-600 text-sm font-medium">Highest Score</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{highest}%</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg shadow p-4 border-l-4 border-orange-600">
                    <p className="text-gray-600 text-sm font-medium">Lowest Score</p>
                    <p className="text-2xl font-bold text-orange-700 mt-1">{lowest}%</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg shadow p-4 border-l-4 border-purple-600">
                    <p className="text-gray-600 text-sm font-medium">Total Subjects</p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">{filteredResults.length}</p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Monthly 1</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Midterm</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Monthly 2</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Final Term</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-700">Term 1</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-700">Term 2</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700">Final Score</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, idx) => {
                    const term1 = result.term_1_total || 0;
                    const term2 = result.term_2_total || 0;
                    const finalScore = result.annual_total || ((term1 + term2) / 2).toFixed(2);
                    
                    // Calculate grade based on final score
                    const getGrade = (score) => {
                      if (score >= 90) return 'A';
                      if (score >= 80) return 'B';
                      if (score >= 70) return 'C';
                      if (score >= 60) return 'D';
                      return 'F';
                    };
                    
                    const performance = getPerformanceIndicator(finalScore);

                    return (
                      <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div>
                            <p className="font-semibold">{result.subject_name}</p>
                            <p className="text-xs text-gray-500">{result.subject_code}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {result.scores?.first_monthly_score || '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {result.scores?.midterm_exam_score || '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {result.scores?.second_monthly_score || '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {result.scores?.final_exam_score || '-'}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-indigo-600">
                          {term1}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-indigo-600">
                          {term2}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-lg text-purple-700">
                          {finalScore}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full font-bold border ${getGradeColor(getGrade(finalScore))}`}>
                            {getGrade(finalScore)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No results available</p>
          <p className="text-gray-500 text-sm mt-2">
            {selectedYear 
              ? `No results found for ${selectedYear}` 
              : 'Your results will appear here as teachers post them'}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">📊 Grading Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-bold text-sm bg-green-100 text-green-800">A</span>
            <span className="text-sm text-gray-600">90–100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-bold text-sm bg-blue-100 text-blue-800">B</span>
            <span className="text-sm text-gray-600">80–89</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-bold text-sm bg-yellow-100 text-yellow-800">C</span>
            <span className="text-sm text-gray-600">70–79</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-bold text-sm bg-orange-100 text-orange-800">D</span>
            <span className="text-sm text-gray-600">60–69</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-bold text-sm bg-red-100 text-red-800">F</span>
            <span className="text-sm text-gray-600">0–59</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResultsView;

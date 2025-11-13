import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { ChevronRight, BookOpen, Calendar, Users } from 'lucide-react';

const SelectAssignments = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/assignments/teacher/me`);
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setAssignments(data);
      } catch (e) {
        console.error('Error fetching assignments:', e);
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAssignments();
    }
  }, [user?.id]);

  const handleSelectAssignment = (assignment) => {
    navigate(
      `/teacher/results?class=${assignment.class_id}&subject=${assignment.subject_id}&year=${assignment.academic_year}`
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Results</h1>
        <p className="text-gray-600 mt-2">Select an assignment to manage student results</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div
              key={`${assignment.class_id}-${assignment.subject_id}-${assignment.academic_year}`}
              onClick={() => handleSelectAssignment(assignment)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white">{assignment.subject_name}</h3>
                <p className="text-indigo-100 text-sm">{assignment.subject_code}</p>
              </div>

              {/* Card Body */}
              <div className="px-6 py-4 space-y-3">
                {/* Class */}
                <div className="flex items-start gap-3">
                  <Users size={18} className="text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Class</p>
                    <p className="text-gray-900 font-semibold">{assignment.class_name}</p>
                  </div>
                </div>

                {/* Academic Year */}
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Academic Year</p>
                    <p className="text-gray-900 font-semibold">{assignment.academic_year}</p>
                  </div>
                </div>

                {/* Subject Code */}
                <div className="flex items-start gap-3">
                  <BookOpen size={18} className="text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Subject</p>
                    <p className="text-gray-900 font-semibold">{assignment.subject_name}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between hover:bg-indigo-50 transition-colors">
                <span className="text-sm font-semibold text-gray-700">Manage Results</span>
                <ChevronRight size={20} className="text-indigo-600" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">No assignments found</p>
            <p className="text-sm text-gray-500 mt-1">
              You haven't been assigned any subjects yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectAssignments;

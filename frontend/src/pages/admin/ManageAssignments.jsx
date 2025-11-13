import { useState, useEffect } from 'react';
import { listTeachers } from '../../services/teachersService';
import { listSubjects } from '../../services/subjectsService';
import { listClasses } from '../../services/classesService';
import {
  listAssignments,
  createAssignment,
  deleteAssignment,
} from '../../services/assignmentsService';

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    teacher_id: '',
    subject_id: '',
    class_id: '',
    academic_year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    try {
      setLoading(true);
      const [assign, teach, subj, cls] = await Promise.all([
        listAssignments(),
        listTeachers(),
        listSubjects(),
        listClasses(),
      ]);
      setAssignments(assign);
      setTeachers(teach);
      setSubjects(subj);
      setClasses(cls);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.teacher_id || !formData.subject_id || !formData.class_id) {
      setError('Please select teacher, subject, and class');
      return false;
    }
    if (!formData.academic_year.trim()) {
      setError('Academic year is required');
      return false;
    }
    return true;
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    try {
      await createAssignment(formData);
      setSuccess('Assignment created');
      setFormData({
        teacher_id: '',
        subject_id: '',
        class_id: '',
        academic_year: new Date().getFullYear().toString(),
      });
      await loadInitial();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await deleteAssignment(id);
      setSuccess('Assignment deleted');
      await loadInitial();
    } catch (err) {
      setError('Failed to delete assignment');
    }
  };

  const resetStatus = () => {
    setError(null);
    setSuccess('');
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;

  const getTeacherName = (id) => teachers.find((t) => t.id === id)?.first_name + ' ' + teachers.find((t) => t.id === id)?.last_name;
  const getSubjectName = (id) => subjects.find((s) => s.id === id)?.name;
  const getClassName = (id) => classes.find((c) => c.id === id)?.name;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Assignments</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          onAnimationEnd={resetStatus}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          onAnimationEnd={resetStatus}
        >
          {success}
        </div>
      )}

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
        <form onSubmit={handleAssign}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Teacher</label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                required
              >
                <option value="">Select teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.first_name} {t.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Subject</label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                required
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Class</label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                required
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Academic Year</label>
              <input
                type="text"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Assign
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-xl font-semibold mb-4">Current Assignments</h2>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Teacher</th>
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Class</th>
              <th className="px-4 py-2 text-left">Academic Year</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-2">{getTeacherName(a.teacher_id)}</td>
                <td className="px-4 py-2">{getSubjectName(a.subject_id)}</td>
                <td className="px-4 py-2">{getClassName(a.class_id)}</td>
                <td className="px-4 py-2">{a.academic_year}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assignments.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No assignments found. Create one using the form above.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAssignments;

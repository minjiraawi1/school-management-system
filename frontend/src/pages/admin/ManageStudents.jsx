import { useEffect, useMemo, useState } from 'react';
import { listClasses } from '../../services/classesService';
import {
  listStudents,
  listStudentsByClass,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../../services/studentsService';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    student_id: '',
    class_id: '',
    date_of_birth: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
  });

  const requiredFields = useMemo(
    () => ['first_name', 'last_name', 'class_id', 'parent_name'],
    []
  );

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedClassId]);

  const loadInitial = async () => {
    try {
      setLoading(true);
      const [cls, stu] = await Promise.all([listClasses(), listStudents()]);
      setClasses(cls);
      setStudents(stu);
      setError(null);
    } catch (e) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = selectedClassId ? await listStudentsByClass(selectedClassId) : await listStudents();
      setStudents(data);
      setError(null);
    } catch (e) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingStudent(null);
    // Generate next student ID
    const nextId = students.length > 0
      ? Math.max(...students.map(s => parseInt(s.student_id.replace('ST', '')) || 0)) + 1
      : 1000;
    const studentId = `ST${nextId}`;
    setFormData({
      username: studentId,
      password: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      student_id: studentId,
      class_id: selectedClassId || '',
      date_of_birth: '',
      parent_name: '',
      parent_phone: '',
      parent_email: '',
    });
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username || '',
      password: '',
      first_name: student.first_name || '',
      middle_name: student.middle_name || '',
      last_name: student.last_name || '',
      student_id: student.student_id || '',
      class_id: student.class_id || '',
      date_of_birth: student.date_of_birth || '',
      parent_name: student.parent_name || '',
      parent_phone: student.parent_phone || '',
      parent_email: student.parent_email || '',
    });
    setShowForm(true);
  };

  const validateForm = () => {
    const missing = requiredFields.filter((f) => !String(formData[f]).trim());
    if (missing.length) {
      setError(`Missing required fields: ${missing.join(', ')}`);
      return false;
    }
    if (!editingStudent && !String(formData.password).trim()) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    try {
      if (editingStudent) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await updateStudent(editingStudent.id, payload);
        setSuccess('Student updated');
      } else {
        await createStudent(formData);
        setSuccess('Student created');
      }
      setShowForm(false);
      setEditingStudent(null);
      await fetchStudents();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await deleteStudent(id);
      setSuccess('Student deleted');
      await fetchStudents();
    } catch (e) {
      setError('Failed to delete student');
    }
  };

  const resetStatus = () => {
    setError(null);
    setSuccess('');
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
        <div className="flex gap-3 items-center">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Add New Student
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" onAnimationEnd={resetStatus}>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" onAnimationEnd={resetStatus}>
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-semibold mb-4">
            {editingStudent ? 'Edit Student' : 'Add New Student'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                  required
                />
              </div>
              {!editingStudent && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Student ID</label>
                <input
                  type="text"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                  required
                />
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
                <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Parent Name</label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Parent Phone</label>
                <input
                  type="tel"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Parent Email</label>
                <input
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                {editingStudent ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Student ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Class</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2 font-semibold">{s.student_id}</td>
                <td className="px-4 py-2">{s.first_name} {s.middle_name ? s.middle_name + ' ' : ''}{s.last_name}</td>
                <td className="px-4 py-2">{classes.find((c) => c.id === s.class_id)?.name || s.class_id}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="text-center py-4 text-gray-500">No students found.</div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;

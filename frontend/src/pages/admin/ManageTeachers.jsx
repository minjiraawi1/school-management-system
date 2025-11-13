import { useState, useEffect, useMemo } from 'react';
import {
  listTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../../services/teachersService';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    employee_id: '',
    specialization: '',
    qualification: '',
    experience_years: '',
    hire_date: '',
  });

  const requiredFields = useMemo(
    () => ['username', 'email', 'first_name', 'last_name', 'employee_id', 'specialization', 'qualification'],
    []
  );

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await listTeachers();
      setTeachers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingTeacher(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      first_name: '',
      last_name: '',
      employee_id: '',
      specialization: '',
      qualification: '',
      experience_years: '',
      hire_date: '',
    });
    setShowForm(true);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      username: teacher.username || '',
      password: '',
      email: teacher.email || '',
      first_name: teacher.first_name || '',
      last_name: teacher.last_name || '',
      employee_id: teacher.employee_id || '',
      specialization: teacher.specialization || '',
      qualification: teacher.qualification || '',
      experience_years: teacher.experience_years || '',
      hire_date: teacher.hire_date ? teacher.hire_date.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const validateForm = () => {
    const missing = requiredFields.filter((f) => !String(formData[f]).trim());
    if (missing.length) {
      setError(`Missing required fields: ${missing.join(', ')}`);
      return false;
    }
    if (!editingTeacher && !String(formData.password).trim()) {
      setError('Password is required for new teachers');
      return false;
    }
    const exp = Number(formData.experience_years);
    if (formData.experience_years && (!Number.isFinite(exp) || exp < 0)) {
      setError('Experience years must be a non-negative number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    try {
      if (editingTeacher) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await updateTeacher(editingTeacher.id, payload);
        setSuccess('Teacher updated');
      } else {
        await createTeacher(formData);
        setSuccess('Teacher created');
      }
      setShowForm(false);
      setEditingTeacher(null);
      await fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save teacher');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await deleteTeacher(id);
      setSuccess('Teacher deleted');
      await fetchTeachers();
    } catch (err) {
      setError('Failed to delete teacher');
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
        <h1 className="text-3xl font-bold text-gray-900">Manage Teachers</h1>
        <button
          onClick={openCreate}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Add New Teacher
        </button>
      </div>

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

      {showForm && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-semibold mb-4">
            {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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
              {!editingTeacher && (
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
                <label className="block text-gray-700 text-sm font-bold mb-2">Employee ID</label>
                <input
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Qualification</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Hire Date</label>
                <input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                {editingTeacher ? 'Update' : 'Create'}
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
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Employee ID</th>
              <th className="px-4 py-2 text-left">Specialization</th>
              <th className="px-4 py-2 text-left">Qualification</th>
              <th className="px-4 py-2 text-left">Experience</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.first_name} {t.last_name}</td>
                <td className="px-4 py-2">{t.employee_id}</td>
                <td className="px-4 py-2">{t.specialization}</td>
                <td className="px-4 py-2">{t.qualification}</td>
                <td className="px-4 py-2">{t.experience_years} years</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEdit(t)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.length === 0 && (
          <div className="text-center py-4 text-gray-500">No teachers found.</div>
        )}
      </div>
    </div>
  );
};

export default ManageTeachers;

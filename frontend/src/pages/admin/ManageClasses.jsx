import { useState, useEffect } from 'react';
import { listClasses, createClass, updateClass, deleteClass } from '../../services/classesService';
import { Plus, Edit2, Trash2, X, BookOpen } from 'lucide-react';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    grade_level: '',
    academic_year: '',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await listClasses();
      setClasses(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const nameOk = String(formData.name).trim().length > 0;
    const yearOk = String(formData.academic_year).trim().length > 0;
    const grade = Number(formData.grade_level);
    const gradeOk = Number.isFinite(grade) && grade >= 1 && grade <= 12;
    if (!nameOk || !yearOk || !gradeOk) {
      setError('Please provide valid name, academic year, and grade level (1–12)');
      return;
    }
    try {
      if (editingClass) {
        await updateClass(editingClass.id, formData);
        setSuccess('Class updated successfully');
      } else {
        await createClass(formData);
        setSuccess('Class created successfully');
      }
      resetForm();
      fetchClasses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save class');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      grade_level: classItem.grade_level,
      academic_year: classItem.academic_year,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteClass(id);
        setSuccess('Class deleted successfully');
        fetchClasses();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete class');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingClass(null);
    setFormData({
      name: '',
      grade_level: '',
      academic_year: '',
    });
    setError(null);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Classes</h1>
          <p className="text-gray-600 mt-1">Create and manage school classes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors"
        >
          <Plus size={20} />
          Add New Class
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X size={18} />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
            <X size={18} />
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Form 1A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grade Level (1-12) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.grade_level}
                  onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Academic Year *
                </label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 2024/2025"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {editingClass ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-indigo-600">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{classItem.name}</h3>
                <p className="text-sm text-gray-600">Grade {classItem.grade_level}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(classItem)}
                  className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(classItem.id)}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">Year: {classItem.academic_year}</p>
          </div>
        ))}
      </div>

      {classes.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <BookOpen size={48} className="mx-auto opacity-50" />
          </div>
          <p className="text-gray-500 text-lg">No classes found</p>
          <p className="text-gray-400">Click "Add New Class" to create one</p>
        </div>
      )}
    </div>
  );
};

export default ManageClasses;

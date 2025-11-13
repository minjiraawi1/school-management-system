import { useState, useEffect } from 'react';
import { listSubjects, createSubject, updateSubject, deleteSubject } from '../../services/subjectsService';
import { Plus, Edit2, Trash2, X, BookOpen } from 'lucide-react';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await listSubjects();
      setSubjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const nameOk = String(formData.name).trim().length > 0;
    const codeOk = String(formData.code).trim().length > 0;
    if (!nameOk || !codeOk) {
      setError('Please provide name and code');
      return;
    }
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, formData);
        setSuccess('Subject updated successfully');
      } else {
        await createSubject(formData);
        setSuccess('Subject created successfully');
      }
      resetForm();
      fetchSubjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save subject');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(id);
        setSuccess('Subject deleted successfully');
        fetchSubjects();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete subject');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      description: '',
    });
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Subjects</h1>
          <p className="text-gray-600 mt-1">Create and manage academic subjects</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors"
        >
          <Plus size={20} />
          Add New Subject
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
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., MATH101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {editingSubject ? 'Update' : 'Create'}
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
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-green-600">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                <p className="text-sm font-mono text-gray-600 mt-1">{subject.code}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(subject)}
                  className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {subject.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{subject.description}</p>
            )}
          </div>
        ))}
      </div>

      {subjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <BookOpen size={48} className="mx-auto opacity-50" />
          </div>
          <p className="text-gray-500 text-lg">No subjects found</p>
          <p className="text-gray-400">Click "Add New Subject" to create one</p>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;

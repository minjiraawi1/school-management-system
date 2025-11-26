import { useState, useEffect } from 'react';
import { listSubjects, createSubject, updateSubject, deleteSubject } from '../../services/subjectsService';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { 
  Plus, Pencil, Trash2, X, BookOpen, Save, Loader2, 
  Hash, FileText, Search, AlertCircle, CheckCircle2 
} from 'lucide-react';
import DeleteConfirmation from '@/components/DeleteConfirmation';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredSubjects(subjects);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredSubjects(
        subjects.filter(
          (s) =>
            s.name?.toLowerCase().includes(lower) ||
            s.code?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTerm, subjects]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await listSubjects();
      setSubjects(data);
      setFilteredSubjects(data);
      setError(null);
    } catch (error) {
      console.error(error);
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
    
    setSubmitting(true);
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
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errors) {
        const messages = error.response.data.errors.map(err => err.msg).join(', ');
        setError(messages);
      } else {
        setError(error.response?.data?.error || 'Failed to save subject');
      }
    } finally {
      setSubmitting(false);
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

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSubject(deleteId);
      setSuccess('Subject deleted successfully');
      fetchSubjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);
      setError('Failed to delete subject');
    } finally {
      setDeleteId(null);
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

  if (loading && !subjects.length) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-100 dark:border-violet-900 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-violet-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Subjects</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage academic subjects</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search subjects..." 
              className="pl-10 h-11 w-full sm:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            className="h-11 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25"
          >
            <Plus size={18} /> Add Subject
          </Button>
        </div>
      </div>

      <DeleteConfirmation
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Subject"
        description="Are you sure you want to delete this subject? This action cannot be undone."
      />

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <AlertCircle size={20} />
          <span className="flex-1 font-medium">{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={20} />
          <span className="flex-1 font-medium">{success}</span>
          <button onClick={() => setSuccess('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                  </h2>
                </div>
                <button 
                  onClick={resetForm}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Subject Name *</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Mathematics"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Subject Code *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., MATH101"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Description</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                      className="pl-10 min-h-[88px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 h-11 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25" 
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {editingSubject ? 'Update Subject' : 'Create Subject'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm} 
                    className="flex-1 h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" 
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subjects Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredSubjects.map((subject) => (
          <Card 
            key={subject.id} 
            className="group border-0 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                    {subject.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-mono font-semibold">
                      {subject.code}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="p-2 hover:bg-violet-50 dark:hover:bg-violet-900/30 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => confirmDelete(subject.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {subject.description ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{subject.description}</p>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">No description</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSubjects.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
            <BookOpen size={40} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {searchTerm ? 'No subjects found' : 'No subjects yet'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms to find what you\'re looking for.'
              : 'Get started by creating your first subject.'}
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => setShowForm(true)} 
              className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
            >
              <Plus size={18} />
              Create First Subject
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;

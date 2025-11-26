import { useState, useEffect } from 'react';
import { listClasses, createClass, updateClass, deleteClass } from '../../services/classesService';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { 
  Plus, Pencil, Trash2, X, BookOpen, Save, Loader2, 
  GraduationCap, Calendar, Users, Search, AlertCircle, CheckCircle2
} from 'lucide-react';
import DeleteConfirmation from '@/components/DeleteConfirmation';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    grade_level: '',
    academic_year: '',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredClasses(classes);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredClasses(
        classes.filter(
          (c) =>
            c.name?.toLowerCase().includes(lower) ||
            c.academic_year?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTerm, classes]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await listClasses();
      setClasses(data);
      setFilteredClasses(data);
      setError(null);
    } catch (error) {
      console.error(error);
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
    
    setSubmitting(true);
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
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errors) {
        const messages = error.response.data.errors.map(err => err.msg).join(', ');
        setError(messages);
      } else {
        setError(error.response?.data?.error || 'Failed to save class');
      }
    } finally {
      setSubmitting(false);
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

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClass(deleteId);
      setSuccess('Class deleted successfully');
      fetchClasses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);
      setError('Failed to delete class');
    } finally {
      setDeleteId(null);
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

  if (loading && !classes.length) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Classes</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage school classes</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search classes..." 
              className="pl-10 h-11 w-full sm:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            className="h-11 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25"
          >
            <Plus size={18} /> Add Class
          </Button>
        </div>
      </div>

      <DeleteConfirmation
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Class"
        description="Are you sure you want to delete this class? This action cannot be undone."
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
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingClass ? 'Edit Class' : 'Add New Class'}
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
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Class Name *</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Form 1A"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Grade Level (1-12) *</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.grade_level}
                      onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                      placeholder="Enter grade level"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Academic Year *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.academic_year}
                      onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                      placeholder="e.g., 2024/2025"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 h-11 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25" 
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {editingClass ? 'Update Class' : 'Create Class'}
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

      {/* Classes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredClasses.map((classItem) => (
          <Card 
            key={classItem.id} 
            className="group border-0 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {classItem.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-500 dark:text-slate-400">
                    <GraduationCap size={14} />
                    <span className="text-sm">Grade {classItem.grade_level}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(classItem)}
                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => confirmDelete(classItem.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <Calendar size={14} />
                <span className="text-sm font-medium">{classItem.academic_year}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClasses.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
            <BookOpen size={40} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {searchTerm ? 'No classes found' : 'No classes yet'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms to find what you\'re looking for.'
              : 'Get started by creating your first class.'}
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => setShowForm(true)} 
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            >
              <Plus size={18} />
              Create First Class
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageClasses;

import { useState, useEffect } from 'react';
import { listTeachers } from '../../services/teachersService';
import { listSubjects } from '../../services/subjectsService';
import { listClasses } from '../../services/classesService';
import {
  listAssignments,
  createAssignment,
  deleteAssignment,
} from '../../services/assignmentsService';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Trash2, Plus, X, Users, BookOpen, GraduationCap, 
  Calendar, AlertCircle, CheckCircle2, Save, Loader2, Link2
} from 'lucide-react';
import DeleteConfirmation from '@/components/DeleteConfirmation';

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
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
      console.error(err);
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
      setSubmitting(true);
      await createAssignment(formData);
      setSuccess('Assignment created successfully');
      setFormData({
        teacher_id: '',
        subject_id: '',
        class_id: '',
        academic_year: new Date().getFullYear().toString(),
      });
      setShowModal(false);
      await loadInitial();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAssignment(deleteId);
      setSuccess('Assignment deleted successfully');
      await loadInitial();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete assignment');
    } finally {
      setDeleteId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError(null);
    setFormData({
      teacher_id: '',
      subject_id: '',
      class_id: '',
      academic_year: new Date().getFullYear().toString(),
    });
  };

  if (loading && !assignments.length) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-pink-100 dark:border-pink-900 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-pink-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading assignments...</p>
      </div>
    );
  }

  const getTeacherName = (id) => {
    const t = teachers.find((t) => t.id === id);
    return t ? `${t.first_name} ${t.last_name}` : id;
  };
  const getSubjectName = (id) => subjects.find((s) => s.id === id)?.name || id;
  const getClassName = (id) => classes.find((c) => c.id === id)?.name || id;

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Assignments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Assign subjects to teachers for specific classes</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)} 
          className="h-11 gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-500/25"
        >
          <Plus size={18} /> Create Assignment
        </Button>
      </div>

      <DeleteConfirmation
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Assignment"
        description="Are you sure you want to delete this assignment? This action cannot be undone."
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

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-0 shadow-2xl bg-white dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                    <Link2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Create Assignment
                  </h2>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleAssign} className="space-y-5">
                {/* Teacher Select */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Teacher *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={formData.teacher_id}
                      onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                      className="h-11 w-full pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
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
                </div>
                {/* Subject Select */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Subject *</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={formData.subject_id}
                      onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                      className="h-11 w-full pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
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
                </div>
                {/* Class Select */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Class *</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={formData.class_id}
                      onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                      className="h-11 w-full pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
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
                </div>
                {/* Academic Year */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Academic Year *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.academic_year}
                      onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                      placeholder="e.g., 2024/2025"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-pink-500 focus:ring-pink-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 h-11 gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-500/25" 
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Create Assignment
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={closeModal} 
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

      {/* Assignments Table */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Current Assignments</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {assignments.length} {assignments.length === 1 ? 'assignment' : 'assignments'} total
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableHead className="font-semibold">Teacher</TableHead>
                <TableHead className="font-semibold">Subject</TableHead>
                <TableHead className="font-semibold">Class</TableHead>
                <TableHead className="font-semibold">Academic Year</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 border-4 border-pink-100 dark:border-pink-900 rounded-full" />
                        <div className="absolute top-0 left-0 w-10 h-10 border-4 border-pink-600 rounded-full border-t-transparent animate-spin" />
                      </div>
                      <span className="text-slate-500 dark:text-slate-400">Loading assignments...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : assignments.length > 0 ? (
                assignments.map((a) => (
                  <TableRow key={a.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-semibold text-xs">
                          {getTeacherName(a.teacher_id).split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {getTeacherName(a.teacher_id)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
                        {getSubjectName(a.subject_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-sm font-medium">
                        {getClassName(a.class_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{a.academic_year}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => confirmDelete(a.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Link2 size={32} className="text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        No assignments found.
                      </p>
                      <Button 
                        variant="link" 
                        onClick={() => setShowModal(true)}
                        className="mt-2 text-pink-600 hover:text-pink-700"
                      >
                        Create your first assignment
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default ManageAssignments;

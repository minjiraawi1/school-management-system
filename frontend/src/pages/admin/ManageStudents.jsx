import { useCallback, useEffect, useMemo, useState } from 'react';
import { listClasses } from '../../services/classesService';
import {
  listStudents,
  listStudentsByClass,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../../services/studentsService';
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
  Plus, Pencil, Trash2, Filter, Save, Loader2, X, Search,
  User, GraduationCap, Calendar, Phone, Users, AlertCircle, CheckCircle2,
  Key, UserCircle
} from 'lucide-react';
import DeleteConfirmation from '@/components/DeleteConfirmation';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
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
  });

  const requiredFields = useMemo(
    () => ['first_name', 'last_name', 'class_id', 'parent_name'],
    []
  );

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(students);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredStudents(
        students.filter(
          (s) =>
            s.first_name?.toLowerCase().includes(lower) ||
            s.last_name?.toLowerCase().includes(lower) ||
            s.student_id?.toLowerCase().includes(lower) ||
            s.parent_name?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTerm, students]);

  const loadInitial = async () => {
    try {
      setLoading(true);
      const [cls, stu] = await Promise.all([listClasses(), listStudents()]);
      setClasses(cls);
      setStudents(stu);
      setFilteredStudents(stu);
      setError(null);
    } catch (error) {
      console.error(error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = selectedClassId ? await listStudentsByClass(selectedClassId) : await listStudents();
        setStudents(data);
        setFilteredStudents(data);
        setError(null);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    if (selectedClassId) {
      fetchStudents();
    }
  }, [selectedClassId]);

  const fetchStudentsManual = useCallback(async () => {
    try {
      setLoading(true);
      const data = selectedClassId ? await listStudentsByClass(selectedClassId) : await listStudents();
      setStudents(data);
      setFilteredStudents(data);
      setError(null);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [selectedClassId]);

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
    });
    setShowForm(true);
  };

  const validateForm = () => {
    const missing = requiredFields.filter((f) => !String(formData[f]).trim());
    if (missing.length) {
      setError(`Missing required fields: ${missing.join(', ')}`);
      return false;
    }
    if (!String(formData.password).trim()) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      if (editingStudent) {
        // For updates, don't send username or student_id as they're read-only
        const payload = { ...formData };
        delete payload.username;
        delete payload.student_id;
        delete payload.parent_email;
        if (!payload.password) delete payload.password;
        await updateStudent(editingStudent.id, payload);
        setSuccess('Student updated successfully');
      } else {
        // For new students, don't send username or student_id - backend auto-generates them
        const payload = { ...formData };
        delete payload.username;
        delete payload.student_id;
        delete payload.parent_email;
        await createStudent(payload);
        setSuccess('Student created successfully');
      }
      setShowForm(false);
      setEditingStudent(null);
      await fetchStudentsManual();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errors) {
        const messages = error.response.data.errors.map(err => err.msg).join(', ');
        setError(messages);
      } else {
        setError(error.response?.data?.error || 'Failed to save student');
      }
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
      await deleteStudent(deleteId);
      setSuccess('Student deleted successfully');
      await fetchStudentsManual();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);
      setError('Failed to delete student');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Students</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage student records</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search students..." 
              className="pl-10 h-11 w-full sm:w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          {/* Class Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="h-11 w-full sm:w-44 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button 
            onClick={openCreate} 
            className="h-11 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25"
          >
            <Plus size={18} /> Add Student
          </Button>
        </div>
      </div>

      <DeleteConfirmation
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        description="Are you sure you want to delete this student? This action cannot be undone."
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

      {/* Form Card */}
      {showForm && (
        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h2>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Auto-generated fields */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Username (Auto-generated)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.username}
                      readOnly
                      disabled
                      className="pl-10 h-11 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Student ID (Auto-generated)</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.student_id}
                      readOnly
                      disabled
                      className="pl-10 h-11 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                {/* Password */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Password *</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder={editingStudent ? 'Leave blank to keep current password' : 'Enter password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                      required={!editingStudent}
                    />
                  </div>
                </div>
                {/* Names */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">First Name *</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Enter first name"
                    className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Middle Name</Label>
                  <Input
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    placeholder="Enter middle name"
                    className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Last Name *</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Enter last name"
                    className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
                {/* Class selection */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Class *</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={formData.class_id}
                      onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                      className="h-11 w-full pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
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
                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                {/* Parent Info */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Parent Name *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.parent_name}
                      onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                      placeholder="Enter parent name"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Parent Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="tel"
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="h-11 px-6 border-slate-200 dark:border-slate-700"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="h-11 px-6 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25" 
                  disabled={submitting}
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingStudent ? 'Update Student' : 'Create Student'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Students Table */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableHead className="font-semibold">Student ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Class</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 border-4 border-emerald-100 dark:border-emerald-900 rounded-full" />
                        <div className="absolute top-0 left-0 w-10 h-10 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin" />
                      </div>
                      <span className="text-slate-500 dark:text-slate-400">Loading students...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <TableRow key={s.id} className="group">
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-mono text-sm font-medium">
                        {s.student_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                          {s.first_name?.[0]}{s.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {s.first_name} {s.middle_name ? s.middle_name + ' ' : ''}{s.last_name}
                          </p>
                          {s.parent_name && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">Parent: {s.parent_name}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm">
                        {classes.find((c) => c.id === s.class_id)?.name || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => confirmDelete(s.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Users size={32} className="text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {searchTerm ? 'No students found matching your search.' : 'No students found.'}
                      </p>
                      {!searchTerm && (
                        <Button 
                          variant="link" 
                          onClick={openCreate}
                          className="mt-2 text-emerald-600 hover:text-emerald-700"
                        >
                          Add your first student
                        </Button>
                      )}
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

export default ManageStudents;

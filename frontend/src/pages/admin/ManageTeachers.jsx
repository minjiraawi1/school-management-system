import { useState, useEffect, useMemo } from 'react';
import {
  listTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../../services/teachersService';
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
  Plus, Pencil, Trash2, Save, Loader2, X, Search,
  User, Mail, Briefcase, GraduationCap, Calendar, Award,
  AlertCircle, CheckCircle2, Key, UserCircle, Clock
} from 'lucide-react';
import DeleteConfirmation from '@/components/DeleteConfirmation';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
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

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTeachers(teachers);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredTeachers(
        teachers.filter(
          (t) =>
            t.first_name?.toLowerCase().includes(lower) ||
            t.last_name?.toLowerCase().includes(lower) ||
            t.employee_id?.toLowerCase().includes(lower) ||
            t.email?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTerm, teachers]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await listTeachers();
      setTeachers(data);
      setFilteredTeachers(data);
      setError(null);
    } catch (error) {
      console.error(error);
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
    
    setSubmitting(true);
    try {
      if (editingTeacher) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await updateTeacher(editingTeacher.id, payload);
        setSuccess('Teacher updated successfully');
      } else {
        await createTeacher(formData);
        setSuccess('Teacher created successfully');
      }
      setShowForm(false);
      setEditingTeacher(null);
      await fetchTeachers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const messages = error.response.data.errors.map(err => err.msg).join(', ');
        setError(messages);
      } else {
        setError(error.response?.data?.error || 'Failed to save teacher');
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
      await deleteTeacher(deleteId);
      setSuccess('Teacher deleted successfully');
      await fetchTeachers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);
      setError('Failed to delete teacher');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading && !teachers.length) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-100 dark:border-amber-900 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading teachers...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Teachers</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage teacher records</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search teachers..." 
              className="pl-10 h-11 w-full sm:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <Button 
            onClick={openCreate} 
            className="h-11 gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-500/25"
          >
            <Plus size={18} /> Add Teacher
          </Button>
        </div>
      </div>

      <DeleteConfirmation
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Teacher"
        description="Are you sure you want to delete this teacher? This action cannot be undone."
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
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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
                {/* Username */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Username *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter username"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
                {/* Password - only for new teachers */}
                {!editingTeacher && (
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Password *</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter password"
                        className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </div>
                )}
                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
                {/* First Name */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">First Name *</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Enter first name"
                    className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>
                {/* Last Name */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Last Name *</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Enter last name"
                    className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>
                {/* Employee ID */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Employee ID *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      placeholder="e.g., EMP001"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
                {/* Specialization */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Specialization *</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g., Mathematics"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
                {/* Qualification */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Qualification *</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g., M.Ed, B.Sc"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
                {/* Experience Years */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Years of Experience</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      min="0"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                      placeholder="Enter years"
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>
                {/* Hire Date */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Hire Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500"
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
                  className="h-11 px-6 gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-500/25" 
                  disabled={submitting}
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingTeacher ? 'Update Teacher' : 'Create Teacher'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Teachers Table */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableHead className="font-semibold">Teacher</TableHead>
                <TableHead className="font-semibold">Employee ID</TableHead>
                <TableHead className="font-semibold">Specialization</TableHead>
                <TableHead className="font-semibold">Qualification</TableHead>
                <TableHead className="font-semibold">Experience</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 border-4 border-amber-100 dark:border-amber-900 rounded-full" />
                        <div className="absolute top-0 left-0 w-10 h-10 border-4 border-amber-600 rounded-full border-t-transparent animate-spin" />
                      </div>
                      <span className="text-slate-500 dark:text-slate-400">Loading teachers...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTeachers.length > 0 ? (
                filteredTeachers.map((t) => (
                  <TableRow key={t.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                          {t.first_name?.[0]}{t.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {t.first_name} {t.last_name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-mono text-sm font-medium">
                        {t.employee_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm">
                        {t.specialization}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">{t.qualification}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Clock size={14} className="text-slate-400" />
                        <span>{t.experience_years} years</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => confirmDelete(t.id)}
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
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <UserCircle size={32} className="text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {searchTerm ? 'No teachers found matching your search.' : 'No teachers found.'}
                      </p>
                      {!searchTerm && (
                        <Button 
                          variant="link" 
                          onClick={openCreate}
                          className="mt-2 text-amber-600 hover:text-amber-700"
                        >
                          Add your first teacher
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

export default ManageTeachers;

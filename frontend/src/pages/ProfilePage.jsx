import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLogin } from '../store/authSlice';
import profileService from '../services/profileService';
import { 
  User, Mail, Lock, Save, Eye, EyeOff, AlertCircle, 
  CheckCircle, Shield, Briefcase, GraduationCap, Calendar,
  Phone, UserCircle, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Admin form state
  const [adminForm, setAdminForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Password form state (for teacher/student)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data.profile);
      
      // Initialize admin form if admin
      if (data.profile.role === 'admin') {
        setAdminForm(prev => ({
          ...prev,
          email: data.profile.email || '',
          first_name: data.profile.first_name || '',
          last_name: data.profile.last_name || ''
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate password fields if provided
    if (adminForm.new_password || adminForm.confirm_password) {
      if (!adminForm.current_password) {
        setError('Current password is required to change password');
        return;
      }
      if (adminForm.new_password !== adminForm.confirm_password) {
        setError('New passwords do not match');
        return;
      }
      if (adminForm.new_password.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
    }

    try {
      setSaving(true);
      const updateData = {
        email: adminForm.email,
        first_name: adminForm.first_name,
        last_name: adminForm.last_name
      };
      
      if (adminForm.new_password) {
        updateData.current_password = adminForm.current_password;
        updateData.new_password = adminForm.new_password;
        updateData.confirm_password = adminForm.confirm_password;
      }
      
      const response = await profileService.updateAdminProfile(updateData);
      setSuccess('Profile updated successfully!');
      
      // Update Redux state with new user info
      const token = localStorage.getItem('token');
      if (token && response.user) {
        dispatch(setLogin({
          user: response.user,
          token: token
        }));
      }
      
      // Clear password fields
      setAdminForm(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate
    if (!passwordForm.current_password) {
      setError('Current password is required');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      await profileService.updatePassword(passwordForm);
      setSuccess('Password updated successfully!');
      
      // Clear form
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5" />;
      case 'teacher':
        return <Briefcase className="w-5 h-5" />;
      case 'student':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'from-purple-500 to-indigo-600';
      case 'teacher':
        return 'from-emerald-500 to-teal-600';
      case 'student':
        return 'from-blue-500 to-cyan-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 lg:p-10">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className={`w-24 h-24 bg-gradient-to-br ${getRoleColor(profile?.role)} rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl`}>
            {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              {profile?.first_name} {profile?.last_name}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white/80">
              {getRoleIcon(profile?.role)}
              <span className="capitalize font-medium">{profile?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
          <CheckCircle size={20} />
          <span className="font-medium">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card className="lg:col-span-1 border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCircle size={20} className="text-indigo-500" />
              Profile Details
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <User size={18} className="text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Username</p>
                <p className="font-medium text-slate-900 dark:text-white">{profile?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Mail size={18} className="text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-medium text-slate-900 dark:text-white">{profile?.email || 'Not set'}</p>
              </div>
            </div>

            {/* Role-specific info */}
            {profile?.role === 'teacher' && profile?.teacher_info && (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <Briefcase size={18} className="text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Employee ID</p>
                    <p className="font-medium text-slate-900 dark:text-white">{profile.teacher_info.employee_id}</p>
                  </div>
                </div>
                {profile.teacher_info.specialization && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <Sparkles size={18} className="text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Specialization</p>
                      <p className="font-medium text-slate-900 dark:text-white">{profile.teacher_info.specialization}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {profile?.role === 'student' && profile?.student_info && (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <GraduationCap size={18} className="text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Student ID</p>
                    <p className="font-medium text-slate-900 dark:text-white">{profile.student_info.student_id}</p>
                  </div>
                </div>
                {profile.student_info.class_name && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <Calendar size={18} className="text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Class</p>
                      <p className="font-medium text-slate-900 dark:text-white">{profile.student_info.class_name}</p>
                    </div>
                  </div>
                )}
                {profile.student_info.parent_name && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <User size={18} className="text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Parent Name</p>
                      <p className="font-medium text-slate-900 dark:text-white">{profile.student_info.parent_name}</p>
                    </div>
                  </div>
                )}
                {profile.student_info.parent_phone && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <Phone size={18} className="text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Parent Phone</p>
                      <p className="font-medium text-slate-900 dark:text-white">{profile.student_info.parent_phone}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Form Card */}
        <Card className="lg:col-span-2 border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {profile?.role === 'admin' ? (
                <>
                  <Shield size={20} className="text-purple-500" />
                  Edit Profile
                </>
              ) : (
                <>
                  <Lock size={20} className="text-amber-500" />
                  Change Password
                </>
              )}
            </CardTitle>
            <CardDescription>
              {profile?.role === 'admin' 
                ? 'Update your profile information and password'
                : 'Update your account password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.role === 'admin' ? (
              // Admin Full Edit Form
              <form onSubmit={handleAdminSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-slate-700 dark:text-slate-300">
                      First Name
                    </Label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <Input
                        id="first_name"
                        value={adminForm.first_name}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, first_name: e.target.value }))}
                        className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-slate-700 dark:text-slate-300">
                      Last Name
                    </Label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <Input
                        id="last_name"
                        value={adminForm.last_name}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, last_name: e.target.value }))}
                        className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Change Password (Optional)
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin_current_password" className="text-slate-700 dark:text-slate-300">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <Input
                          id="admin_current_password"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={adminForm.current_password}
                          onChange={(e) => setAdminForm(prev => ({ ...prev, current_password: e.target.value }))}
                          className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          placeholder="Enter current password to change"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin_new_password" className="text-slate-700 dark:text-slate-300">
                          New Password
                        </Label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <Input
                            id="admin_new_password"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={adminForm.new_password}
                            onChange={(e) => setAdminForm(prev => ({ ...prev, new_password: e.target.value }))}
                            className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            placeholder="New password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin_confirm_password" className="text-slate-700 dark:text-slate-300">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <Input
                            id="admin_confirm_password"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={adminForm.confirm_password}
                            onChange={(e) => setAdminForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                            className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            placeholder="Confirm password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save size={18} />
                      Save Changes
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              // Teacher/Student Password-Only Form
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Note:</strong> You can only change your password. Contact an administrator to update other profile information.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-slate-700 dark:text-slate-300">
                      Current Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <Input
                        id="current_password"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                        className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-slate-700 dark:text-slate-300">
                      New Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <Input
                        id="new_password"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                        className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Enter new password (min 6 characters)"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password" className="text-slate-700 dark:text-slate-300">
                      Confirm New Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <Input
                        id="confirm_password"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                        className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Confirm your new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating Password...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock size={18} />
                      Update Password
                    </div>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

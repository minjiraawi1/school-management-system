import React, { useState } from 'react';
import { Eye, EyeOff, GraduationCap, BookOpen, Users, Award, Sparkles, Shield, Zap } from 'lucide-react';

// --- ANIMATED BACKGROUND ---
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Gradient mesh background */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
    
    {/* Animated gradient orbs */}
    <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
    <div className="absolute top-0 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
    <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
    <div className="absolute bottom-40 right-20 w-60 h-60 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-3000" />
    
    {/* Grid pattern overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
    
    {/* Radial gradient overlay */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
  </div>
);

// --- FEATURE CARD ---
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div className={`animate-element ${delay} group flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300`}>
    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-5 h-5 text-purple-300" />
    </div>
    <div>
      <h3 className="font-semibold text-white/90 text-sm">{title}</h3>
      <p className="text-white/50 text-xs mt-0.5">{description}</p>
    </div>
  </div>
);

// --- STAT PILL ---
const StatPill = ({ value, label, delay }) => (
  <div className={`animate-element ${delay} flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm`}>
    <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{value}</span>
    <span className="text-white/60 text-sm">{label}</span>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage = ({
  title = "SchoolHub",
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  return (
    <div className="min-h-[100dvh] flex w-full bg-slate-950 text-white overflow-hidden">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
        <AnimatedBackground />
        
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo & Branding */}
          <div className="animate-element animate-delay-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/25">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">SchoolHub</span>
            </div>
            <p className="text-white/50 text-sm ml-14">Educational Management System</p>
          </div>

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center max-w-xl">
            <h1 className="animate-element animate-delay-200 text-4xl xl:text-5xl font-bold leading-tight mb-4">
              <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Empowering Education
              </span>
              <br />
              <span className="text-white/90">Through Innovation</span>
            </h1>
            
            <p className="animate-element animate-delay-300 text-white/60 text-lg mb-8 leading-relaxed">
              A comprehensive platform for administrators, teachers, and students to manage academic excellence.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 mb-10">
              <StatPill value="500+" label="Students" delay="animate-delay-400" />
              <StatPill value="50+" label="Teachers" delay="animate-delay-500" />
              <StatPill value="100%" label="Success" delay="animate-delay-600" />
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <FeatureCard
                icon={BookOpen}
                title="Smart Gradebook"
                description="Automated grade calculations"
                delay="animate-delay-700"
              />
              <FeatureCard
                icon={Users}
                title="Class Management"
                description="Streamlined organization"
                delay="animate-delay-800"
              />
              <FeatureCard
                icon={Award}
                title="Performance Tracking"
                description="Real-time analytics"
                delay="animate-delay-900"
              />
              <FeatureCard
                icon={Shield}
                title="Secure Platform"
                description="Enterprise-grade security"
                delay="animate-delay-1000"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="animate-element animate-delay-1200 text-white/40 text-sm">
            © 2025 SchoolHub. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-950 lg:bg-slate-900/50 relative">
        {/* Mobile background */}
        <div className="lg:hidden absolute inset-0">
          <AnimatedBackground />
        </div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="animate-element animate-delay-100 inline-flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/25">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">SchoolHub</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/80 lg:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="animate-element animate-delay-100 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 mb-4">
                <Sparkles className="w-7 h-7 text-purple-400" />
              </div>
              <h2 className="animate-element animate-delay-200 text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="animate-element animate-delay-300 text-white/50 text-sm">Sign in to access your dashboard</p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={onSignIn}>
              {/* Username Field */}
              <div className="animate-element animate-delay-400">
                <label className="block text-sm font-medium text-white/70 mb-2">Username</label>
                <div className={`relative rounded-xl border transition-all duration-300 ${
                  focusedInput === 'username' 
                    ? 'border-purple-500/50 bg-purple-500/5 shadow-lg shadow-purple-500/10' 
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}>
                  <input 
                    name="username" 
                    type="text" 
                    placeholder="Enter your username" 
                    className="w-full bg-transparent text-white text-sm p-4 rounded-xl focus:outline-none placeholder:text-white/30" 
                    required 
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="animate-element animate-delay-500">
                <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                <div className={`relative rounded-xl border transition-all duration-300 ${
                  focusedInput === 'password' 
                    ? 'border-purple-500/50 bg-purple-500/5 shadow-lg shadow-purple-500/10' 
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}>
                  <input 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter your password" 
                    className="w-full bg-transparent text-white text-sm p-4 pr-12 rounded-xl focus:outline-none placeholder:text-white/30" 
                    required 
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-4 flex items-center"
                  >
                    {showPassword 
                      ? <EyeOff className="w-5 h-5 text-white/40 hover:text-white/70 transition-colors" /> 
                      : <Eye className="w-5 h-5 text-white/40 hover:text-white/70 transition-colors" />
                    }
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot */}
              <div className="animate-element animate-delay-600 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" name="rememberMe" className="sr-only peer" />
                    <div className="w-5 h-5 rounded-md border border-white/20 bg-white/5 peer-checked:bg-purple-500 peer-checked:border-purple-500 transition-all" />
                    <svg className="absolute top-1 left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">Remember me</span>
                </label>
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} 
                  className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading} 
                className="animate-element animate-delay-700 w-full relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Role Info */}
            <div className="animate-element animate-delay-800 mt-8 pt-6 border-t border-white/10">
              <p className="text-center text-white/40 text-xs mb-3">Login as:</p>
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">Admin</span>
                <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">Teacher</span>
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">Student</span>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <p className="animate-element animate-delay-900 text-center text-white/40 text-sm mt-6">
            Need help? Contact your administrator
          </p>
        </div>
      </div>
    </div>
  );
};

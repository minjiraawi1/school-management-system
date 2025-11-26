import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLogin, setLoading, setError } from '../store/authSlice';
import { authAPI } from '../services/api';
import { SignInPage } from '@/components/ui/sign-in';

const sampleTestimonials = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "The school management system has completely transformed how we handle student records. It's intuitive and powerful."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "As a teacher, I love how easy it is to grade assignments and track student progress. Highly recommended!"
  },
];

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    setIsLoading(true);
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await authAPI.login({
        username: data.username,
        password: data.password
      });
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Update Redux store
      dispatch(setLogin({
        user: response.user,
        token: response.token,
      }));

      // Redirect based on role
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      dispatch(setError(errorMessage));
      alert(errorMessage); // Simple alert for now as the UI handles errors differently
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  const handleGoogleSignIn = () => {
    alert("Google Sign In is not configured yet.");
  };

  return (
    <SignInPage
      title={<span className="font-bold text-indigo-600 tracking-tight">SchoolHub</span>}
      description="Welcome back! Please sign in to access your dashboard."
      heroImageSrc="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=2160&q=80"
      testimonials={sampleTestimonials}
      onSignIn={handleSubmit}
      onGoogleSignIn={handleGoogleSignIn}
      isLoading={isLoading}
    />
  );
};

export default LoginPage;
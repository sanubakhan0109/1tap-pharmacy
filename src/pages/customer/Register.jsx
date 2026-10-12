import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Lock, Mail, User, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { usePageMeta } from '../../utils/seo';

function GoogleIcon({ className = 'h-4.5 w-4.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function CustomerRegister() {
  usePageMeta({ title: 'Create Account', description: 'Create a free 1TAP Pharmacy account for faster checkout and order tracking.', path: '/register' });
  const { register, signInWithGoogle, customerUser, loading: authLoading } = useCustomerAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || location.state?.from || '/profile';

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && customerUser) {
      navigate(from, { replace: true });
    }
  }, [customerUser, authLoading, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(formData.email, formData.password, {
      fullName: formData.fullName.trim()
    });
    setIsSubmitting(false);

    if (result.success) {
      navigate('/profile', { replace: true });
    } else {
      setErrorMessage(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleSubmitting(true);

    const result = await signInWithGoogle();
    if (!result.success) {
      setIsGoogleSubmitting(false);
      setErrorMessage(result.error || 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[82vh] flex flex-col justify-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header Card Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* 1TAP Pharmacy Logo Branding */}
        <Link
          to="/"
          className="group flex items-center justify-center gap-2.5 mb-5 transition hover:opacity-95"
        >
          <img
            src="/1tap-pharmacy-logo.png"
            alt="1TAP Pharmacy Logo"
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-full shadow-2xs transition-transform duration-200 group-hover:scale-105"
          />
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
            1TAP
          </span>
          <span className="text-stone-300 font-light text-lg select-none">|</span>
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-stone-500 font-semibold group-hover:text-stone-700 transition">
            COSMETICS
          </span>
        </Link>

        {/* Heading & Subtitle */}
        <h1 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
          Create your account
        </h1>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
          Join 1TAP and start shopping healthcare essentials.
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl border border-stone-200/90 bg-white px-6 py-8 sm:px-9 shadow-xl shadow-stone-200/50 backdrop-blur-xs">
          
          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200/90 p-3.5 flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* 1. Google Button at the Top */}
          <button
            type="button"
            id="google-register-btn"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 active:bg-stone-100 py-2.5 px-4 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs transition-all duration-150 cursor-pointer disabled:opacity-60"
          >
            {isGoogleSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="h-4.5 w-4.5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* 2. Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              OR
            </span>
            <div className="border-t border-stone-200 w-full" />
          </div>

          {/* 3. Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isSubmitting || isGoogleSubmitting}
                  placeholder="Priya Sharma"
                  className="block w-full rounded-xl border border-stone-300 bg-stone-50/40 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-stone-400 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting || isGoogleSubmitting}
                  placeholder="name@example.com"
                  className="block w-full rounded-xl border border-stone-300 bg-stone-50/40 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-stone-400 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting || isGoogleSubmitting}
                  placeholder="Minimum 6 characters"
                  className="block w-full rounded-xl border border-stone-300 bg-stone-50/40 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-stone-400 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting || isGoogleSubmitting}
                  placeholder="Re-enter password"
                  className="block w-full rounded-xl border border-stone-300 bg-stone-50/40 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-stone-400 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="customer-register-btn"
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-800 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-slate-950/10 transition duration-150 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>

          </form>

          {/* 4. Switch to Login */}
          <div className="mt-6 border-t border-stone-100 pt-5 text-center">
            <p className="text-xs sm:text-sm text-stone-600">
              Already have an account?{' '}
              <Link
                to="/login"
                state={{ from: location.state?.from }}
                className="font-bold text-slate-950 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, Loader2, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { usePageMeta } from '../../utils/seo';

export default function AdminLogin() {
  usePageMeta({ title: 'Admin Login', path: '/admin/login', noindex: true });
  const { login, user, isAdmin, loading: authLoading, privilegesLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const checksSettled = !authLoading && !privilegesLoading;

  // Already signed in as an authorized admin -> go straight to the dashboard.
  useEffect(() => {
    if (checksSettled && user && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [user, isAdmin, checksSettled, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      // Authorized admin -> straight to the dashboard (or original destination).
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || 'Failed to authenticate. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 text-slate-100 selection:bg-indigo-600 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        {/* Brand Icon & Heading */}
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-black tracking-tight text-white">
          1TAP Admin Portal
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-400">
          Sign in to manage products, catalog inventory, and customer orders
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 px-6 py-8 sm:px-10 shadow-2xl backdrop-blur-xl">

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="admin@1tap.com"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="••••••••••••"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-500 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="admin-login-submit-btn"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 px-4 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition duration-150 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </div>

          </form>

          {/* Return to Customer Storefront */}
          <div className="mt-6 border-t border-slate-800 pt-5 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Customer Store</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

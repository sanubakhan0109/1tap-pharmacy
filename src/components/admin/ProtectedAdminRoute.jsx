import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ShieldAlert, Loader2, LogOut, ArrowLeft, KeyRound } from 'lucide-react';

export default function ProtectedAdminRoute() {
  const { user, isAdmin, loading, logout, privilegesLoading } = useAdminAuth();
  const location = useLocation();

  // 1. Loading State (session or admin lookup pending)
  if (loading || privilegesLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
              <KeyRound className="h-8 w-8 text-indigo-400" />
            </div>
            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin absolute -bottom-1 -right-1" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-wide">1TAP Admin Portal</h2>
            <p className="text-xs text-slate-400">Verifying credentials and security permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated -> Redirect to /admin/login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated but NOT authorized in admin_users table.
  // Customer-safe generic message. Detailed diagnostics go to dev-only logs.
  if (!isAdmin) {
    if (import.meta.env.DEV) {
      console.debug('[1TAP Admin] 403: signed-in user lacks admin privileges.', {
        email: user.email,
        userId: user.id,
      });
    }
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/20">
              403 Unauthorized Access
            </span>
            <h1 className="text-xl font-bold text-white">Access Denied</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              This account does not have access to the admin area. If you
              believe this is a mistake, please contact support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={logout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600/90 hover:bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>

            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 transition active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin - dashboard access granted
  return <Outlet />;
}

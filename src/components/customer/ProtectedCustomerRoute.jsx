import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedCustomerRoute() {
  const { customerUser, loading } = useCustomerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
        <p className="text-xs text-slate-500 font-medium">Verifying account session...</p>
      </div>
    );
  }

  if (!customerUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

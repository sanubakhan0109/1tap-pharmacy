import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { STOREFRONT_URL } from '../../utils/storefront';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  Sparkles
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const navItemClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
    }`;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-md shadow-indigo-500/30">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-wider text-white">1TAP</span>
              <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Management Suite</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Navigation
          </p>

          <NavLink
            to="/admin"
            end
            onClick={() => setMobileSidebarOpen(false)}
            className={navItemClasses}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            onClick={() => setMobileSidebarOpen(false)}
            className={navItemClasses}
          >
            <Package className="h-4 w-4" />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            onClick={() => setMobileSidebarOpen(false)}
            className={navItemClasses}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/admin/inquiries"
            onClick={() => setMobileSidebarOpen(false)}
            className={navItemClasses}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Inquiries</span>
          </NavLink>
        </div>

        {/* Quick Utilities */}
        <div className="space-y-1 border-t border-slate-800/80 pt-4">
          <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Storefront
          </p>
          <a
            href={STOREFRONT_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Customer Store</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          </a>
        </div>
      </div>

      {/* User profile & Logout */}
      <div className="border-t border-slate-800/80 pt-4 space-y-3">
        <div className="rounded-xl bg-slate-800/60 p-3 border border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400">Signed in as</p>
          <p className="text-xs font-semibold text-slate-200 truncate mt-0.5" title={user?.email}>
            {user?.email || 'Admin'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          id="admin-sidebar-logout-btn"
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2.5 text-xs font-bold text-red-400 transition active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">

      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-sm text-white tracking-wider">1TAP ADMIN</span>
        </div>

        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl border-r border-slate-800 z-50">
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop Fixed Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800/80 bg-slate-900/70 sticky top-0 h-screen">
          {sidebarContent}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-slate-950 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

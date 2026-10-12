import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Toast from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import { ToastProvider } from './context/ToastContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Admin Pages & Guard — same imports as src/App.jsx (admin section)
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminInquiries from './pages/admin/AdminInquiries';

// Ensures the robots noindex from admin.html survives SPA navigation.
// (src/utils/seo.js only manages robots for pages that call usePageMeta.)
function AdminNoIndex() {
  useEffect(() => {
    let meta = document.head.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
  }, []);
  return null;
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <AdminAuthProvider>
        <ScrollToTop />
        <Toast />
        <AdminNoIndex />
        <Routes>
          {/* ================= Admin Authentication ================= */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ================= Protected Admin Area ================= */}
          {/* Same route tree as the admin section in src/App.jsx */}
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/new" element={<AdminProductForm />} />
              <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
              <Route path="/admin/inquiries" element={<AdminInquiries />} />
            </Route>
          </Route>

          {/* Standalone admin entry: root goes to the dashboard (guard redirects to login if needed) */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/index.html" element={<Navigate to="/admin" replace />} />
          <Route path="/admin.html" element={<Navigate to="/admin" replace />} />

          {/* Unknown admin URL: fall back to dashboard entry instead of customer 404 */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminAuthProvider>
    </ToastProvider>
  );
}

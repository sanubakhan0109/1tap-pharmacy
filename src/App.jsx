import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import Chatbot from './components/chatbot/Chatbot';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

// Customer Storefront Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Shipping from './pages/Shipping';

// Customer Account Pages & Guard
import CustomerLogin from './pages/customer/Login';
import CustomerRegister from './pages/customer/Register';
import CustomerProfile from './pages/customer/Profile';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerOrderTracking from './pages/customer/CustomerOrderTracking';
import ProtectedCustomerRoute from './components/customer/ProtectedCustomerRoute';

// Admin Pages & Guard
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminInquiries from './pages/admin/AdminInquiries';

// Layout wrapper for Customer Storefront
function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf9] text-slate-900 selection:bg-slate-900 selection:text-white font-sans antialiased">
      <ScrollToTop />
      <Navbar />
      <Toast />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AdminAuthProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <Routes>
              
              {/* ================= Customer Storefront & Account Routes ================= */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/shipping" element={<Shipping />} />

                {/* Customer Public Auth Routes */}
                <Route path="/login" element={<CustomerLogin />} />
                <Route path="/register" element={<CustomerRegister />} />

                {/* Customer Protected Account Routes */}
                <Route element={<ProtectedCustomerRoute />}>
                  <Route path="/profile" element={<CustomerProfile />} />
                  <Route path="/orders" element={<CustomerOrders />} />
                  <Route path="/orders/:id" element={<CustomerOrderTracking />} />
                </Route>

                {/* Static-host alias: some hosts/CDNs normalize or link to /index.html.
                    Without this, BrowserRouter sees pathname "/index.html" which matches
                    no route below, so the "*" catch-all renders the 404 page. */}
                <Route path="/index.html" element={<Navigate to="/" replace />} />

                {/* 404 Catch-All — any invalid URL renders inside CustomerLayout (shared Navbar/Footer) */}
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* ================= Admin Authentication ================= */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* ================= Protected Admin Area ================= */}
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

            </Routes>
          </CartProvider>
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </ToastProvider>
  );
}



import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminDashboardStats } from '../../services/orderService';
import { AdminTableSkeleton } from '../../components/skeletons';
import {
  Package,
  ShoppingCart,
  Clock,
  Sparkles,
  TrendingUp,
  Plus,
  ArrowRight,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    newOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminDashboardStats();
    if (res.success) {
      setStats(res.stats);
      setRecentOrders(res.recentOrders || []);
    } else {
      setError(res.error || 'Failed to fetch dashboard metrics.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || 'New').toLowerCase();
    switch (s) {
      case 'new':
      case 'pending':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'confirmed':
      case 'processing':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'shipped':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'delivered':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'cancelled':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Admin Dashboard
            </h1>
            <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
              Live System
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time catalog metrics, inventory numbers, and customer orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadStats}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-center gap-3 text-amber-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Products */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xs transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Products
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <span role="status" aria-label="Loading total products" className="block">
                <span aria-hidden="true" className="skeleton-shimmer-dark block h-9 w-20 rounded-lg" />
              </span>
            ) : (
              <span className="text-2xl sm:text-3xl font-black text-white">
                {stats.totalProducts}
              </span>
            )}
            <span className="text-xs text-slate-400 ml-1.5 font-medium">in catalog</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <Link to="/admin/products" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <span>View products</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xs transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <span role="status" aria-label="Loading total orders" className="block">
                <span aria-hidden="true" className="skeleton-shimmer-dark block h-9 w-20 rounded-lg" />
              </span>
            ) : (
              <span className="text-2xl sm:text-3xl font-black text-white">
                {stats.totalOrders}
              </span>
            )}
            <span className="text-xs text-slate-400 ml-1.5 font-medium">
              {stats.totalOrders === 1 ? 'order' : 'orders'} placed
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <Link to="/admin/orders" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              <span>Manage orders</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* New / Pending Orders */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xs transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              New & Pending Orders
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <span role="status" aria-label="Loading new and pending orders" className="block">
                <span aria-hidden="true" className="skeleton-shimmer-dark block h-9 w-16 rounded-lg" />
              </span>
            ) : (
              <span className="text-2xl sm:text-3xl font-black text-amber-300">
                {(stats.newOrders + stats.pendingOrders)}
              </span>
            )}
            <span className="text-xs text-slate-400 ml-1.5 font-medium">requiring dispatch</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">
              {stats.newOrders} New • {stats.pendingOrders} Pending
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xs transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Sales Volume
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <span role="status" aria-label="Loading total sales volume" className="block">
                <span aria-hidden="true" className="skeleton-shimmer-dark block h-9 w-28 rounded-lg" />
              </span>
            ) : (
              <span className="text-2xl sm:text-3xl font-black text-white">
                {`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
              </span>
            )}
            <span className="text-xs text-slate-400 ml-1.5 font-medium">COD volume</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Cash on Delivery</span>
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/products/new"
          className="group flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 transition hover:border-indigo-500/50 hover:bg-slate-900/80"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
              Add New Product
            </h3>
            <p className="text-xs text-slate-400">Upload photos, set price & stock</p>
          </div>
        </Link>

        <Link
          to="/admin/products"
          className="group flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 transition hover:border-emerald-500/50 hover:bg-slate-900/80"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
              Product Inventory
            </h3>
            <p className="text-xs text-slate-400">Edit, update status or delete items</p>
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="group flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 transition hover:border-sky-500/50 hover:bg-slate-900/80"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-600/10 border border-sky-500/20 text-sky-400 group-hover:scale-105 transition">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition">
              Customer Orders
            </h3>
            <p className="text-xs text-slate-400">Track shipments & update status</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Recent Customer Orders</h2>
            <p className="text-xs text-slate-400">Latest orders submitted by customers</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>View all orders ({stats.totalOrders})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <AdminTableSkeleton columns={7} rows={5} label="Loading recent orders" />
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-300">0 Orders</p>
            <p className="text-xs text-slate-500">No customer orders have been placed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 pr-4 font-mono text-slate-300">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-white">
                      {order.customer_name}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400">
                      {order.phone}
                    </td>
                    <td className="py-3.5 pr-4 font-bold text-slate-200">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold border ${getStatusBadge(order.status)}`}>
                        {order.status || 'New'}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

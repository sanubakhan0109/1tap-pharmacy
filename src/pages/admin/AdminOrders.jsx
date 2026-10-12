import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminOrders, updateOrderStatus } from '../../services/orderService';
import { AdminTableSkeleton } from '../../components/skeletons';
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminOrders({
      search: searchQuery,
      status: selectedStatus
    });

    if (res.success) {
      setOrders(res.orders);
    } else {
      setError(res.error || 'Failed to fetch customer orders.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleQuickStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      setToastMessage(`Order status updated to "${newStatus}".`);
      loadOrders();
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setError(res.error || 'Failed to update order status.');
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'New').toLowerCase();
    switch (s) {
      case 'new':
      case 'pending':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'confirmed':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'processing':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
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

  const statusTabs = [
    'All',
    'New',
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Customer Orders
            </h1>
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            View customer shipping details, line items, payment records, and update order fulfillment statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center justify-between gap-3 text-emerald-300 text-xs shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-4">
        
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedStatus(tab)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                selectedStatus === tab
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-800/60">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              id="admin-order-search"
              placeholder="Search by customer name, phone, city, or Order UUID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 active:scale-95"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  loadOrders();
                }}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Orders Table Container */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-xs">
        {loading ? (
          <AdminTableSkeleton columns={7} rows={6} label="Loading customer orders" />
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
              <ShoppingCart className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">No orders found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedStatus !== 'All'
                ? 'No customer orders match the selected filters.'
                : 'There are no customer orders recorded in the database yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 pl-4 pr-3">Order ID</th>
                  <th className="py-3.5 px-3">Customer</th>
                  <th className="py-3.5 px-3">Phone</th>
                  <th className="py-3.5 px-3">Location</th>
                  <th className="py-3.5 px-3">Items</th>
                  <th className="py-3.5 px-3">Total</th>
                  <th className="py-3.5 px-3">Payment</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition">
                    {/* Order ID */}
                    <td className="py-3.5 pl-4 pr-3">
                      <span className="font-mono text-indigo-300 font-medium">
                        {order.id.slice(0, 8)}...
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white truncate max-w-[140px]" title={order.customer_name}>
                        {order.customer_name}
                      </div>
                      {order.email && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]" title={order.email}>
                          {order.email}
                        </div>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-3 text-slate-300 font-medium">
                      {order.phone}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-3 text-slate-400">
                      {order.city}, {order.state}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-3 text-slate-300">
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-semibold">
                        {order.itemsCount || (order.order_items?.length ?? 1)} items
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-3 font-bold text-white">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                        {order.payment_method || 'COD'}
                      </span>
                    </td>

                    {/* Status Dropdown / Badge */}
                    <td className="py-3.5 px-3">
                      <select
                        value={order.status || 'New'}
                        onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold border outline-none cursor-pointer bg-slate-900 ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        <option value="New">New</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 pr-4 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        id={`view-order-${order.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Details</span>
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

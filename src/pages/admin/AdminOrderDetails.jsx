import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAdminOrderById, updateOrderStatus } from '../../services/orderService';
import { AdminDetailSkeleton } from '../../components/skeletons';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Truck
} from 'lucide-react';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminOrderById(id);
    if (res.success && res.order) {
      setOrder(res.order);
      setSelectedStatus(res.order.status || 'New');
    } else {
      setError(res.error || 'Failed to load order information.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === order?.status) return;
    setUpdating(true);
    const res = await updateOrderStatus(id, selectedStatus);
    setUpdating(false);

    if (res.success) {
      setOrder((prev) => ({ ...prev, status: selectedStatus }));
      setToastMessage(`Order status updated to "${selectedStatus}".`);
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

  if (loading) {
    return <AdminDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-slate-400">The requested order does not exist or has been removed.</p>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const items = order.order_items || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Order Details
            </h1>
            <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
              #{order.id}
            </span>
            <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold border ${getStatusBadge(order.status)}`}>
              {order.status || 'New'}
            </span>
          </div>
        </div>

        {/* Status Update Actions */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={updating}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-500"
          >
            <option value="New">New</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={handleUpdateStatus}
            disabled={updating || selectedStatus === order.status}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95 disabled:opacity-50"
          >
            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span>Update Status</span>
          </button>
        </div>
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

      {/* 2-Column Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Customer & Delivery Info */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Customer Details Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" />
              <span>Customer Information</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-bold text-white text-sm">{order.customer_name}</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Number</span>
                  <a href={`tel:${order.phone}`} className="font-semibold text-indigo-300 hover:underline">
                    {order.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="font-medium text-slate-300">
                    {order.email || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>Delivery Address</span>
            </h2>

            <div className="space-y-2 text-xs">
              <p className="text-slate-200 leading-relaxed font-medium">
                {order.address}
              </p>
              <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[11px]">City</span>
                  <span className="font-semibold">{order.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">State</span>
                  <span className="font-semibold">{order.state}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">PIN Code</span>
                  <span className="font-mono font-bold text-indigo-300">{order.pincode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Meta Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Placed On</span>
              </span>
              <span className="font-medium text-slate-200">
                {new Date(order.created_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                <span>Payment Method</span>
              </span>
              <span className="font-bold text-emerald-400">
                {order.payment_method || 'COD'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
              <span className="text-slate-400">Payment Status</span>
              <span className="font-semibold text-slate-300">
                {order.payment_status || 'Pending (Pay upon delivery)'}
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Ordered Items & Financial Summary */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Order Items Table Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-indigo-400" />
              <span>Purchased Products ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
            </h2>

            {items.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Line items details not available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="pb-3 pr-3">Product</th>
                      <th className="pb-3 px-3 text-center">Qty</th>
                      <th className="pb-3 px-3 text-right">Price</th>
                      <th className="pb-3 pl-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-3.5 pr-3">
                          <p className="font-bold text-white">{item.product_name}</p>
                          {item.product_id && (
                            <p className="text-[10px] text-slate-400 font-mono">ID: {item.product_id}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-300">
                          x{item.quantity}
                        </td>
                        <td className="py-3.5 px-3 text-right text-slate-300">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 pl-3 text-right font-bold text-white">
                          ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Financial Totals */}
            <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal || order.total_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge</span>
                <span>{order.delivery_charge > 0 ? `₹${Number(order.delivery_charge)}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800/60">
                <span>Total Amount Due</span>
                <span className="text-emerald-400">
                  ₹{Number(order.total_amount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Fulfillment Instructions Card */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 space-y-2 text-xs text-indigo-300">
            <div className="flex items-center gap-2 font-bold text-indigo-200">
              <Truck className="h-4 w-4" />
              <span>COD Fulfillment Note</span>
            </div>
            <p className="text-[11px] text-indigo-300/80 leading-relaxed">
              When courier partner is assigned, update status to <strong>Shipped</strong>. Upon successful cash collection and delivery confirmation, mark order as <strong>Delivered</strong>.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

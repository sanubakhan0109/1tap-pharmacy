import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCustomerOrders } from '../../services/orderService';
import {
  Package,
  ArrowRight,
  ShoppingBag,
  Calendar,
  AlertCircle,
  Clock,
  RefreshCw,
  Truck
} from 'lucide-react';
import { usePageMeta } from '../../utils/seo';
import { OrderListSkeleton } from '../../components/skeletons';

export default function CustomerOrders() {
  usePageMeta({ title: 'My Orders', path: '/orders', noindex: true });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchCustomerOrders();
    if (res.success) {
      setOrders(res.orders || []);
    } else {
      setError(res.error || 'Failed to load your orders.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || 'New').toLowerCase();
    switch (s) {
      case 'new':
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'confirmed':
      case 'processing':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-slate-800 border-stone-200';
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/90 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              My Orders
            </h1>
            <span className="rounded-md bg-stone-200 px-2 py-0.5 text-xs font-bold text-slate-700">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            View all your past purchases and track real-time fulfillment status.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-stone-50 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <OrderListSkeleton count={3} label="Loading your orders" />
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center space-y-4 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-slate-600">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-950">No orders yet</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't placed any orders with 1TAP yet. Explore products from top brands and find your favorites!
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-slate-800"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {orders.map((order) => {
            const items = order.order_items || [];
            return (
              <div
                key={order.id}
                className="group rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs transition hover:border-stone-300 hover:shadow-md space-y-4"
              >
                {/* Order Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3.5 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Order ID:</span>
                      <span className="font-mono text-slate-700 bg-stone-100 px-2 py-0.5 rounded-md text-[11px]">
                        #{order.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Placed on{' '}
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status || 'New'}
                    </span>

                    <Link
                      to={`/orders/${order.id}`}
                      id={`track-order-${order.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-slate-800 active:scale-95"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Track Order</span>
                    </Link>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-2">
                  <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                    Purchased Items ({order.itemsCount || items.length})
                  </p>

                  <div className="divide-y divide-stone-100">
                    {items.slice(0, 3).map((item, idx) => (
                      <div key={item.id || idx} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate max-w-sm">
                          <span className="font-semibold text-slate-800">{item.product_name}</span>
                          <span className="text-slate-400">×{item.quantity}</span>
                        </div>
                        <span className="font-bold text-slate-900">
                          ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-[11px] text-slate-500 pt-1 italic">
                        + {items.length - 3} more {items.length - 3 === 1 ? 'item' : 'items'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                  <div className="text-slate-500">
                    <span>Payment: </span>
                    <span className="font-semibold text-slate-800">
                      Cash on Delivery ({order.payment_status || 'Pending'})
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-500">Total:</span>
                    <span className="text-base font-black text-slate-950">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

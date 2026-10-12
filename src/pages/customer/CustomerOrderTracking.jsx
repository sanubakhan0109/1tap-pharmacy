import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCustomerOrderById } from '../../services/orderService';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Check,
  XCircle,
  ShoppingBag,
  MapPin,
  Calendar,
  CreditCard,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { usePageMeta } from '../../utils/seo';
import { OrderTrackingSkeleton } from '../../components/skeletons';

export default function CustomerOrderTracking() {
  usePageMeta({ title: 'Track Order', path: `/orders/${useParams().id}`, noindex: true });
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchCustomerOrderById(id);
    if (res.success && res.order) {
      setOrder(res.order);
    } else {
      setError(res.error || 'Unable to retrieve order details or order does not exist.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  // Visual tracking stages definition
  const TRACKING_STAGES = [
    { key: 'New', label: 'Order Placed', description: 'We received your order request' },
    { key: 'Confirmed', label: 'Order Confirmed', description: 'Order verified and packed' },
    { key: 'Processing', label: 'Processing', description: 'Handed over to fulfillment' },
    { key: 'Shipped', label: 'Out for Delivery', description: 'Dispatched to your address' },
    { key: 'Delivered', label: 'Delivered', description: 'Handed over & payment collected' }
  ];

  const getStageIndex = (status) => {
    const s = (status || 'New').toLowerCase();
    switch (s) {
      case 'new':
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  if (loading) {
    return <OrderTrackingSkeleton />;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-950">Order Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested order could not be located in your account.'}</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'Cancelled';
  const currentStageIndex = getStageIndex(order.status);
  const items = order.order_items || [];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16">
      
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/90 pb-6 mb-8">
        <div className="space-y-1">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 mb-1 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to My Orders</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Order Tracking
            </h1>
            <span className="font-mono text-xs text-slate-800 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md font-semibold">
              #{order.id}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={loadOrder}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-stone-50 transition active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Visual Order Status Timeline */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-950">Fulfillment Status</h2>
              <p className="text-xs text-slate-500">Live order progression from 1TAP warehouse</p>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold border ${
                isCancelled
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                Current: {order.status || 'New'}
              </span>
            </div>
          </div>

          {isCancelled ? (
            /* Cancelled Alert Banner */
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 flex items-start gap-4 text-rose-900">
              <XCircle className="h-7 w-7 text-rose-600 shrink-0" />
              <div className="space-y-1 text-xs">
                <h3 className="font-bold text-sm text-rose-950">This order was cancelled</h3>
                <p className="text-rose-800 leading-relaxed">
                  Your order has been cancelled and will not be dispatched. If you did not request this or have questions, please reach out to 1TAP customer support.
                </p>
              </div>
            </div>
          ) : (
            /* 5-Step Visual Timeline */
            <div className="pt-2">
              <div className="relative">
                
                {/* Horizontal Progress Bar (Desktop) */}
                <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-stone-100 -z-0">
                  <div
                    className="h-full bg-slate-950 transition-all duration-500"
                    style={{
                      width: `${(currentStageIndex / (TRACKING_STAGES.length - 1)) * 100}%`
                    }}
                  />
                </div>

                {/* Steps List */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                  {TRACKING_STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div key={stage.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                        
                        {/* Step Circle */}
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            isCompleted
                              ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                              : 'border-stone-300 bg-white text-stone-400'
                          } ${isCurrent ? 'ring-4 ring-slate-950/10' : ''}`}
                        >
                          {isCompleted ? (
                            <Check className="h-5 w-5 stroke-[2.5]" />
                          ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Step Labels */}
                        <div className="space-y-0.5">
                          <p
                            className={`text-xs font-bold ${
                              isCompleted ? 'text-slate-950' : 'text-slate-400'
                            }`}
                          >
                            {stage.label}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-tight hidden sm:block">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

          <div className="border-t border-stone-100 pt-3 text-center text-[11px] text-slate-400">
            Order tracking updates automatically as our dispatch team updates your fulfillment package.
          </div>
        </div>

        {/* 2-Column Details: Shipping Info + Purchased Products */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: Delivery Address & Meta */}
          <div className="md:col-span-5 space-y-6">
            
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-stone-100 pb-2.5 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-700" />
                <span>Delivery Address</span>
              </h3>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-900 text-sm">{order.customer_name}</p>
                <p className="text-slate-700 leading-relaxed font-medium">{order.address}</p>
                <div className="pt-2 border-t border-stone-100 text-slate-600">
                  <p>{order.city}, {order.state} - <span className="font-mono font-bold text-slate-900">{order.pincode}</span></p>
                  <p className="mt-1">Phone: <span className="font-semibold text-slate-900">{order.phone}</span></p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Placed On</span>
                </span>
                <span className="font-semibold text-slate-900">
                  {new Date(order.created_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 pt-2">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Payment Method</span>
                </span>
                <span className="font-bold text-slate-900">
                  Cash on Delivery (COD)
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 pt-2">
                <span className="text-slate-500">Payment Status</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  {order.payment_status || 'Pay on Delivery'}
                </span>
              </div>
            </div>

          </div>

          {/* Right: Ordered Items & Total */}
          <div className="md:col-span-7">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-slate-700" />
                <span>Purchased Products ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
              </h3>

              <div className="divide-y divide-stone-100">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 max-w-xs">
                      <p className="font-bold text-slate-900">{item.product_name}</p>
                      <p className="text-[11px] text-slate-500">
                        ₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-black text-slate-950 text-sm">
                      ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Total Breakdown */}
              <div className="border-t border-stone-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotal || order.total_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-stone-100">
                  <span>Total Due (COD)</span>
                  <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

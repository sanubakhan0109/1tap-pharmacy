import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, MapPin, Truck, ArrowRight } from 'lucide-react';
import { usePageMeta } from '../utils/seo';

export default function OrderConfirmation() {
  usePageMeta({ title: 'Order Confirmed', path: '/order-confirmation', noindex: true });
  const location = useLocation();

  // Read order from navigation state or fallback to sessionStorage
  let order = location.state?.order;
  if (!order) {
    try {
      const cached = sessionStorage.getItem('1tap_last_order');
      if (cached) {
        order = JSON.parse(cached);
      }
    } catch (e) {
      console.error('Failed to parse cached order:', e);
    }
  }

  if (!order) {
    return <Navigate to="/" replace />;
  }

  const shortOrderId = order.orderId ? String(order.orderId).slice(0, 12).toUpperCase() : '1TAP-ORDER';

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      
      {/* Success Badge Banner */}
      <div className="text-center space-y-3">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2 ring-8 ring-emerald-50">
          <CheckCircle2 className="h-10 w-10 stroke-[2.2]" />
        </div>
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Order Placed Successfully!
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Thank you for choosing 1TAP. Your order is being prepared and will be delivered to your address.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Order Header Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Order Reference</span>
            <p className="text-xl font-bold text-slate-950">
              #{shortOrderId}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Payment Status</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-800">
                Cash on Delivery (Pending)
              </span>
            </div>
          </div>
        </div>

        {/* Ordered Products Section */}
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">
            <Package className="h-4 w-4 text-slate-700" />
            <span>Items Ordered</span>
          </h2>

          <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200/80 bg-stone-50/40 p-4">
            {order.items && order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/1tap-pharmacy-logo.png';
                      }}
                      className="h-14 w-14 rounded-xl object-cover border border-stone-200 bg-white"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-sm text-slate-950">{item.name}</h3>
                    <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-950 text-sm">
                  ₹{Number(item.price) * item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer & Delivery Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 pt-6">
          
          {/* Shipping Address */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-800">
              <MapPin className="h-4 w-4 text-slate-700" />
              <span>Delivery Address</span>
            </div>
            <p className="font-semibold text-sm text-slate-900">{order.customer?.fullName}</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {order.customer?.address}<br />
              {order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}
            </p>
            <p className="text-xs text-slate-600 pt-1">
              <span className="font-medium text-slate-800">Phone:</span> {order.customer?.phone}
            </p>
            {order.customer?.email && (
              <p className="text-xs text-slate-600">
                <span className="font-medium text-slate-800">Email:</span> {order.customer?.email}
              </p>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-800 mb-3">
                <Truck className="h-4 w-4 text-slate-700" />
                <span>Payment & Delivery</span>
              </div>
              
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">₹{order.totals?.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-medium text-emerald-700">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-medium text-slate-900">Cash on Delivery</span>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-3 mt-4 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-slate-900">Total Payable</span>
              <span className="text-xl font-bold text-slate-950">₹{order.totals?.totalAmount}</span>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-4 text-center">
          <Link
            to="/products"
            id="confirmation-continue-shopping-btn"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 active:scale-95"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

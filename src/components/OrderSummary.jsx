import React from 'react';
import { Truck, ShieldCheck } from 'lucide-react';

export default function OrderSummary({ items = [], subtotal = 0, deliveryCharge = 0, totalAmount = 0, showItemList = false }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Order Summary
      </h2>

      {/* Item preview list if requested */}
      {showItemList && items.length > 0 && (
        <div className="mb-5 space-y-3 divide-y divide-slate-100 border-b border-slate-100 pb-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 pt-3 first:pt-0">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/1tap-pharmacy-logo.png';
                  }}
                  className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                ₹{Number(item.price) * item.quantity}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-medium text-slate-900">₹{subtotal}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-emerald-600" />
            <span>Delivery</span>
          </span>
          <span className="font-medium text-emerald-600">
            {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
          </span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Payment Method</span>
          <span className="font-medium text-slate-900">Cash on Delivery</span>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-slate-900">Total</span>
            <div className="text-right">
              <span className="text-xl font-bold text-slate-950">₹{totalAmount}</span>
              <p className="text-xs text-slate-500">Inclusive of all taxes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="h-4 w-4 text-slate-700 shrink-0 mt-0.5" />
        <p>100% Genuine & Authentic Products. Pay securely with cash upon delivery at your doorstep.</p>
      </div>
    </div>
  );
}


import React from 'react';
import { Banknote } from 'lucide-react';

export default function CheckoutForm({ formData, onChange, errors, isSubmitting }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <div className="space-y-6">
      {/* Customer Contact & Delivery Details */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">
          1. Delivery Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. Priya Sharma"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2 focus:ring-slate-900/10 ${
                errors.fullName ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-slate-900 bg-white'
              }`}
            />
            {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="10-digit mobile number"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2 focus:ring-slate-900/10 ${
                errors.phone ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-slate-900 bg-white'
              }`}
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email Address <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="priya@example.com"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2 focus:ring-slate-900/10 ${
                errors.email ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-slate-900 bg-white'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
          </div>

          {/* Street Address */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Street Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Flat / House No., Building, Street, Area"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2 focus:ring-slate-900/10 ${
                errors.address ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-slate-900 bg-white'
              }`}
            />
            {errors.address && <p className="mt-1 text-xs text-rose-500">{errors.address}</p>}
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. Mumbai"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2 focus:ring-slate-900/10 ${
                errors.city ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-slate-900 bg-white'
              }`}
            />
            {errors.city && <p className="mt-1 text-xs text-rose-500">{errors.city}</p>}
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              State <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. Maharashtra"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2 focus:ring-slate-900/10 ${
                errors.state ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-slate-900 bg-white'
              }`}
            />
            {errors.state && <p className="mt-1 text-xs text-rose-500">{errors.state}</p>}
          </div>

          {/* Pincode */}
          <div>
            <label htmlFor="pincode" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Pincode <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              maxLength={6}
              value={formData.pincode}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="6-digit PIN"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2 focus:ring-slate-900/10 ${
                errors.pincode ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-slate-900 bg-white'
              }`}
            />
            {errors.pincode && <p className="mt-1 text-xs text-rose-500">{errors.pincode}</p>}
          </div>
        </div>
      </div>

      {/* Payment Method Section - COD Only */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">
          2. Payment Method
        </h2>

        <div className="rounded-xl border-2 border-slate-900 bg-slate-50/60 p-4 transition-all flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={true}
              readOnly
              className="h-4 w-4 text-slate-900 focus:ring-slate-900 accent-slate-900"
            />
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-slate-900" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Cash on Delivery (COD)</p>
                <p className="text-xs text-slate-500">Pay in cash when your order arrives at your address</p>
              </div>
            </div>
          </label>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Available
          </span>
        </div>
      </div>
    </div>
  );
}

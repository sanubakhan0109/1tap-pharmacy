import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  Loader2,
  Package,
  ShoppingBag,
  LogOut,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { usePageMeta } from '../../utils/seo';

export default function CustomerProfile() {
  usePageMeta({ title: 'My Profile', path: '/profile', noindex: true });
  const { customerUser, customerProfile, updateProfile, logout } = useCustomerAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill profile data
  useEffect(() => {
    if (customerProfile) {
      setFormData({
        fullName: customerProfile.full_name || '',
        phone: customerProfile.phone || '',
        address: customerProfile.address || '',
        city: customerProfile.city || '',
        state: customerProfile.state || '',
        pincode: customerProfile.pincode || ''
      });
    }
  }, [customerProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    setIsSubmitting(true);
    const result = await updateProfile(formData);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Your profile and default delivery details have been saved.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setErrorMessage(result.error || 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/90 pb-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            My Profile
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Manage your personal contact information and default doorstep delivery address.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-stone-50 transition"
          >
            <Package className="h-4 w-4" />
            <span>My Orders</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 shadow-2xs hover:bg-rose-50 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800 text-xs shadow-2xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Form Grid */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Contact Information */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-slate-700" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Priya Sharma"
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="10-digit mobile number"
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Account Email <span className="text-slate-400 font-normal lowercase">(managed by auth)</span>
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{customerUser?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Default Delivery Address */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-700" />
            <span>Default Delivery Address</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Street Address */}
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Street / Flat / Building Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Flat / House No., Building, Street, Area"
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g. Mumbai"
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g. Maharashtra"
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {/* Pincode */}
            <div>
              <label htmlFor="pincode" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                PIN Code
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
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            id="save-profile-btn"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-800 px-6 py-3 text-xs font-bold text-white shadow-2xs transition duration-150 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}

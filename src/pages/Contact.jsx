import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Send, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { submitInquiry } from '../services/inquiryService';
import { usePageMeta } from '../utils/seo';

function InstagramIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Contact() {
  usePageMeta({
    title: 'Contact Us',
    description: 'Contact 1TAP Pharmacy support by email, phone or Instagram, or send us an inquiry and we will get back to you.',
    path: '/contact',
  });

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please enter your name.';
    if (!form.email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (form.phone.trim() && !/^[+\d][\d\s-]{6,19}$/.test(form.phone.trim())) {
      errs.phone = 'Please enter a valid phone number.';
    }
    if (!form.message.trim()) {
      errs.message = 'Please enter your message.';
    } else if (form.message.trim().length < 10) {
      errs.message = 'Please describe your inquiry in at least 10 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (isSubmitting) return;
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const result = await submitInquiry(form);
      if (result.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(result.error || 'Could not send your inquiry. Please try again.');
      }
    } catch {
      setSubmitError('Could not send your inquiry. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2 focus:ring-slate-900/10 bg-white ${
      hasError ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-slate-900'
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition mb-4">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Home</span>
      </Link>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">Contact Us</h1>
      <p className="mt-1 text-sm text-slate-600">Questions about products, orders or delivery? Reach out — we reply as soon as we can.</p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Direct contact channels (verified details only) */}
        <div className="lg:col-span-4 space-y-3">
          <a href="mailto:support@1tap.in" className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 hover:border-stone-300 hover:shadow-sm transition">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shrink-0"><Mail className="h-4 w-4" /></span>
            <span><span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Email</span><span className="block text-sm font-semibold text-slate-900 break-all">support@1tap.in</span></span>
          </a>
          <a href="tel:+919762622762" className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 hover:border-stone-300 hover:shadow-sm transition">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shrink-0"><Phone className="h-4 w-4" /></span>
            <span><span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Phone</span><span className="block text-sm font-semibold text-slate-900">+91 97626 22762</span></span>
          </a>
          <a href="https://www.instagram.com/1tappharmacy/?hl=en" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 hover:border-stone-300 hover:shadow-sm transition">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shrink-0"><InstagramIcon className="h-4 w-4" /></span>
            <span><span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Instagram</span><span className="block text-sm font-semibold text-slate-900">@1tappharmacy</span></span>
          </a>
        </div>

        {/* Inquiry form / thank-you state */}
        <div className="lg:col-span-8 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="py-10 text-center space-y-3" role="status">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200"><CheckCircle2 className="h-7 w-7 text-emerald-600" /></span>
              <h2 className="text-xl font-bold text-slate-900">Thank you! Your inquiry was received.</h2>
              <p className="mx-auto max-w-md text-sm text-slate-600">Our team will review your message and contact you on your email address if a reply is needed.</p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/products" className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800">Continue Shopping</Link>
                <button type="button" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '' }); }} className="inline-flex items-center justify-center rounded-xl border border-stone-300 px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-stone-50">Send another inquiry</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h2 className="text-lg font-bold text-slate-900">Send us an inquiry</h2>
              <p className="text-xs text-slate-500 mt-0.5 mb-5">Fields marked * are required.</p>
              {submitError && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-start gap-2.5" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{submitError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Name *</label>
                  <input id="contact-name" type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} disabled={isSubmitting} placeholder="Your full name" autoComplete="name" className={inputClass(errors.name)} />
                  {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Email *</label>
                  <input id="contact-email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} disabled={isSubmitting} placeholder="you@example.com" autoComplete="email" className={inputClass(errors.email)} />
                  {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Phone <span className="text-slate-400 font-normal normal-case">(optional)</span></label>
                  <input id="contact-phone" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} disabled={isSubmitting} placeholder="10-digit mobile number" autoComplete="tel" className={inputClass(errors.phone)} />
                  {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Message *</label>
                  <textarea id="contact-message" rows={5} value={form.message} onChange={(e) => handleChange('message', e.target.value)} disabled={isSubmitting} placeholder="How can we help you?" className={`${inputClass(errors.message)} resize-y`} />
                  {errors.message && <p className="mt-1 text-xs text-rose-500">{errors.message}</p>}
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? (<><Send className="h-4 w-4 animate-pulse" /><span>Sending...</span></>) : (<><Send className="h-4 w-4" /><span>Send Inquiry</span></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

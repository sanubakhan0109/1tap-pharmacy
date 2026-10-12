import { Link } from 'react-router-dom';
import { usePageMeta } from '../utils/seo';
import {
  House,
  ShoppingBag,
  Stethoscope,
  Pill,
  ShieldCheck,
  Mail
} from 'lucide-react';

export default function NotFound() {
  usePageMeta({ title: 'Page Not Found', path: window.location.pathname });
  return (
    <section className="bg-white">
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        {/* Pharmacy-themed illustration */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute h-40 w-40 rounded-full bg-sky-100/70 blur-2xl sm:h-52 sm:w-52" />
          <div className="absolute h-28 w-28 rounded-full bg-rose-100/80 blur-xl sm:h-36 sm:w-36" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0b3b6f] to-[#14539a] text-white shadow-xl shadow-[#0b3b6f]/25 sm:h-28 sm:w-28">
            <Stethoscope className="h-11 w-11 sm:h-13 sm:w-13" style={{ height: 48, width: 48 }} />
            <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-rose-600 text-white shadow-md">
              <Pill className="h-4 w-4" />
            </span>
          </div>
        </div>

        {/* 404 number */}
        <p className="bg-gradient-to-r from-[#0b3b6f] via-sky-600 to-[#0b3b6f] bg-clip-text text-7xl font-black tracking-tight text-transparent sm:text-8xl lg:text-9xl">
          404
        </p>

        {/* Heading + supporting text */}
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
          Oops! Page Not Found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        {/* Trust badge */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          1TAP Pharmacy — 100% Genuine Products
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:min-w-[420px] sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700 active:scale-95 sm:flex-none sm:px-8"
          >
            <House className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            to="/products"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#0b3b6f] bg-white px-6 py-3 text-sm font-bold text-[#0b3b6f] transition hover:bg-sky-50 active:scale-95 sm:flex-none sm:px-8"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </Link>
        </div>

        {/* Support link */}
        <p className="mt-8 text-xs text-slate-500 sm:text-sm">
          Need help?{' '}
          <a
            href="mailto:support@1tap.in"
            className="inline-flex items-center gap-1 font-semibold text-sky-700 underline-offset-2 hover:text-sky-800 hover:underline"
          >
            <Mail className="h-3.5 w-3.5" />
            Contact us
          </a>
        </p>
      </div>
    </section>
  );
}

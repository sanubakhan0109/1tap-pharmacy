
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  Truck,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

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

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#0B1228] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          
          {/* ================= COLUMN 1 — 1TAP ================= */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                1TAP
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#C9A96E] uppercase">
                STORE
              </span>
            </div>
            
            <p className="text-sm leading-relaxed text-slate-400">
              1TAP is an online store where you can shop skincare, beauty and cosmetic products from multiple trusted brands.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
                <ShieldCheck className="h-4 w-4 text-[#C9A96E]" />
                <span className="font-medium">100% Genuine Branded Products</span>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2 — QUICK LINKS ================= */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="group inline-flex items-center gap-1.5 text-slate-400 transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 transition-colors duration-200 group-hover:text-sky-400" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-1.5 text-slate-400 transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 transition-colors duration-200 group-hover:text-sky-400" />
                  <span>Products</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-1.5 text-slate-400 transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 transition-colors duration-200 group-hover:text-sky-400" />
                  <span>Search</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="group inline-flex items-center gap-1.5 text-slate-400 transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 transition-colors duration-200 group-hover:text-sky-400" />
                  <span>My Orders</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="group inline-flex items-center gap-1.5 text-slate-400 transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 transition-colors duration-200 group-hover:text-sky-400" />
                  <span>My Profile</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-1.5 text-slate-400 transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 transition-colors duration-200 group-hover:text-sky-400" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= COLUMN 3 — CUSTOMER SUPPORT ================= */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Support
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@1tap.in"
                  className="group flex items-start gap-2.5 text-slate-400 transition-colors duration-200 hover:text-white"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-sky-400 group-hover:border-sky-500/40 group-hover:bg-sky-950/40 transition-colors duration-200">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Email</p>
                    <p className="text-slate-300 font-medium group-hover:text-sky-300 transition-colors duration-200 break-all">
                      support@1tap.in
                    </p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:+919762622762"
                  className="group flex items-start gap-2.5 text-slate-400 transition-colors duration-200 hover:text-white"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-sky-400 group-hover:border-sky-500/40 group-hover:bg-sky-950/40 transition-colors duration-200">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Phone</p>
                    <p className="text-slate-300 font-medium group-hover:text-sky-300 transition-colors duration-200">
                      +91 97626 22762
                    </p>
                  </div>
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400 pt-0.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-sky-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-slate-300 font-medium">Cash on Delivery</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-sky-400">
                  <Truck className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-slate-300 font-medium">Delivery Information</span>
              </li>
            </ul>
          </div>

          {/* ================= COLUMN 4 — CONNECT WITH US ================= */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Connect With Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://www.instagram.com/1tappharmacy/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 text-slate-400 transition-colors duration-200 hover:text-white"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-pink-400 group-hover:border-pink-500/40 group-hover:bg-pink-950/40 transition-all duration-200 group-hover:scale-110">
                    <InstagramIcon className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-300 group-hover:text-pink-300 transition-colors duration-200">
                      Instagram (@1tap)
                    </span>
                    <ArrowUpRight className="h-3 w-3 text-slate-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-pink-400" />
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@1tap.in"
                  className="group flex items-center gap-2.5 text-slate-400 transition-colors duration-200 hover:text-white"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-sky-400 group-hover:border-sky-500/40 group-hover:bg-sky-950/40 transition-all duration-200 group-hover:scale-105">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-slate-300 group-hover:text-sky-300 transition-colors duration-200 break-all text-xs">
                    support@1tap.in
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+919762622762"
                  className="group flex items-center gap-2.5 text-slate-400 transition-colors duration-200 hover:text-white"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-sky-400 group-hover:border-sky-500/40 group-hover:bg-sky-950/40 transition-all duration-200 group-hover:scale-105">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-slate-300 group-hover:text-sky-300 transition-colors duration-200 text-xs">
                    +91 97626 22762
                  </span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* ================= BOTTOM FOOTER DIVIDER & COPYRIGHT ================= */}
        <div className="mt-12 border-t border-slate-800/80 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-slate-500">
              © 2026 1TAP. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[11px] font-medium">
              <Link to="/privacy" className="text-slate-500 hover:text-slate-300 transition">Privacy Policy</Link>
              <Link to="/terms" className="text-slate-500 hover:text-slate-300 transition">Terms</Link>
              <Link to="/shipping" className="text-slate-500 hover:text-slate-300 transition">Delivery & Refunds</Link>
              <span className="hidden sm:inline text-slate-600">Multi-Brand Skincare & Beauty Online Store</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

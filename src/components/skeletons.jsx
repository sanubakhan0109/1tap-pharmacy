import React from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';

/**
 * Shared 1TAP skeleton primitives.
 *
 * - Every decorative bar is aria-hidden; each loading region carries
 *   role="status" with an aria-label so screen readers announce one
 *   concise message instead of placeholder noise.
 * - Bars use .skeleton-shimmer(. -dark) from index.css, which honours
 *   prefers-reduced-motion with a static fallback.
 * - All widths are fluid (w-full / fractions / max-w-*) inside min-w-0
 *   containers, so skeletons can never cause horizontal overflow.
 */

export function ShimmerBar({ className = '', dark = false }) {
  return (
    <div
      aria-hidden="true"
      className={`${dark ? 'skeleton-shimmer-dark' : 'skeleton-shimmer'} rounded ${className}`}
    />
  );
}

function StatusRegion({ label, className = '', children }) {
  return (
    <div role="status" aria-label={label} className={`min-w-0 ${className}`}>
      {children}
    </div>
  );
}

/* ---------- 1. Product grid (Home / Products) ---------- */

export function ProductGridSkeleton({ count = 6, label = 'Loading products' }) {
  return (
    <StatusRegion label={label}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </StatusRegion>
  );
}

/* ---------- 3a. Product details ---------- */

export function ProductDetailsSkeleton() {
  return (
    <StatusRegion label="Loading product details">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-16">
        <ShimmerBar className="h-4 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="md:col-span-5 flex justify-center min-w-0 w-full">
            <ShimmerBar className="aspect-square w-full max-w-sm !rounded-xl" />
          </div>
          <div className="md:col-span-7 space-y-4 min-w-0 w-full">
            <div className="space-y-2">
              <ShimmerBar className="h-4 w-40" />
              <ShimmerBar className="h-8 w-3/4 !rounded-lg" />
              <div className="flex items-baseline gap-3 pt-1">
                <ShimmerBar className="h-7 w-24" />
                <ShimmerBar className="h-4 w-16" />
              </div>
            </div>
            <div className="border-t border-stone-100 pt-3 space-y-2">
              <ShimmerBar className="h-3 w-28" />
              <ShimmerBar className="h-3 w-full" />
              <ShimmerBar className="h-3 w-11/12" />
              <ShimmerBar className="h-3 w-3/4" />
            </div>
            <div className="space-y-2 rounded-xl bg-stone-50 p-3.5 border border-stone-200/80">
              <ShimmerBar className="h-3 w-32 mb-1" />
              <ShimmerBar className="h-3 w-full" />
              <ShimmerBar className="h-3 w-5/6" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <ShimmerBar className="h-11 w-24 !rounded-lg" />
              <ShimmerBar className="h-12 flex-1 !rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </StatusRegion>
  );
}

/* ---------- 3b. Search dropdown (Navbar, desktop + mobile) ---------- */

export function SearchDropdownSkeleton({ rows = 3 }) {
  return (
    <StatusRegion label="Searching products">
      <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
        <div className="px-2 py-1">
          <ShimmerBar className="h-2.5 w-36" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <ShimmerBar className="h-10 w-10 shrink-0 !rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <ShimmerBar className="h-3 w-3/4" />
              <ShimmerBar className="h-2.5 w-1/2" />
            </div>
            <ShimmerBar className="h-3.5 w-12 shrink-0" />
          </div>
        ))}
      </div>
    </StatusRegion>
  );
}

/* ---------- 4a. Customer order list ---------- */

export function OrderCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
        <div className="space-y-1.5 min-w-0">
          <div className="skeleton-shimmer h-4 w-44 rounded" />
          <div className="skeleton-shimmer h-3 w-32 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer h-6 w-20 rounded-lg" />
          <div className="skeleton-shimmer h-8 w-28 rounded-xl" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton-shimmer h-2.5 w-32 rounded" />
        <div className="skeleton-shimmer h-3.5 w-full rounded" />
        <div className="skeleton-shimmer h-3.5 w-5/6 rounded" />
      </div>
      <div className="flex items-center justify-between border-t border-stone-100 pt-3">
        <div className="skeleton-shimmer h-3.5 w-32 rounded" />
        <div className="skeleton-shimmer h-5 w-20 rounded" />
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 3, label = 'Loading your orders' }) {
  return (
    <StatusRegion label={label}>
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    </StatusRegion>
  );
}

/* ---------- 4b. Customer order tracking ---------- */

export function OrderTrackingSkeleton() {
  return (
    <StatusRegion label="Loading your order tracking status">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/90 pb-6 mb-8">
          <div className="space-y-2 min-w-0">
            <ShimmerBar className="h-3.5 w-32" />
            <ShimmerBar className="h-8 w-64 max-w-full !rounded-lg" />
            <ShimmerBar className="h-3.5 w-48" />
          </div>
          <ShimmerBar className="h-7 w-28 !rounded-lg shrink-0" />
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <ShimmerBar className="h-4 w-44" />
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <ShimmerBar className="h-9 w-9 shrink-0 !rounded-full" />
                {i < 3 && <div aria-hidden="true" className="h-0.5 flex-1 rounded bg-stone-100" />}
              </React.Fragment>
            ))}
          </div>
          <div className="space-y-2 border-t border-stone-100 pt-4">
            <ShimmerBar className="h-3.5 w-full" />
            <ShimmerBar className="h-3.5 w-2/3" />
          </div>
          <div className="flex items-center justify-between border-t border-stone-100 pt-3">
            <ShimmerBar className="h-3.5 w-36" />
            <ShimmerBar className="h-5 w-24" />
          </div>
        </div>
      </div>
    </StatusRegion>
  );
}

/* ---------- 4c. Admin dashboard stats ---------- */

export function AdminStatSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xs"
    >
      <div className="flex items-center justify-between">
        <div className="skeleton-shimmer-dark h-3 w-24 rounded" />
        <div className="skeleton-shimmer-dark h-10 w-10 rounded-xl" />
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <div className="skeleton-shimmer-dark h-8 w-20 rounded-lg" />
        <div className="skeleton-shimmer-dark h-3 w-16 rounded" />
      </div>
      <div className="mt-3 pt-3 border-t border-slate-800/60">
        <div className="skeleton-shimmer-dark h-3 w-28 rounded" />
      </div>
    </div>
  );
}

export function AdminStatsGridSkeleton({ count = 4 }) {
  return (
    <StatusRegion label="Loading dashboard statistics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <AdminStatSkeleton key={i} />
        ))}
      </div>
    </StatusRegion>
  );
}

/* ---------- 4d. Admin tables (orders / products / inquiries / recent) ---------- */

export function AdminTableSkeleton({ columns = 5, rows = 5, label = 'Loading records' }) {
  return (
    <StatusRegion label={label}>
      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-hidden="true">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-3.5 px-3 first:pl-4 last:pr-4">
                  <div className="skeleton-shimmer-dark h-2.5 w-full min-w-[60px] rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="py-3.5 px-3 first:pl-4 last:pr-4">
                    <div
                      className="skeleton-shimmer-dark h-3.5 rounded"
                      style={{ width: `${[72, 55, 84, 64, 48, 76, 60, 68][(r + c) % 8]}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StatusRegion>
  );
}

/* ---------- 4e. Admin detail (order details) ---------- */

export function AdminDetailSkeleton() {
  return (
    <StatusRegion label="Loading order details">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <ShimmerBar dark className="h-3.5 w-32" />
            <ShimmerBar dark className="h-8 w-64 max-w-full !rounded-lg" />
          </div>
          <ShimmerBar dark className="h-9 w-32 !rounded-xl shrink-0" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 sm:p-6 space-y-3">
            <div className="skeleton-shimmer-dark h-4 w-40 rounded" />
            <div className="skeleton-shimmer-dark h-3.5 w-full rounded" />
            <div className="skeleton-shimmer-dark h-3.5 w-11/12 rounded" />
            <div className="skeleton-shimmer-dark h-3.5 w-4/5 rounded" />
            <div className="skeleton-shimmer-dark h-3.5 w-2/3 rounded" />
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 sm:p-6 space-y-3">
            <div className="skeleton-shimmer-dark h-4 w-32 rounded" />
            <div className="skeleton-shimmer-dark h-3.5 w-full rounded" />
            <div className="skeleton-shimmer-dark h-3.5 w-3/4 rounded" />
            <div className="skeleton-shimmer-dark h-9 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </StatusRegion>
  );
}

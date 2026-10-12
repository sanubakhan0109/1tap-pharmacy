import React from 'react';

// Loading placeholder that mirrors ProductCard dimensions so the
// grid does not jump when real products finish loading.
// Decorative bars use the shared shimmer (reduced-motion safe);
// the region wrapper in skeletons.jsx announces loading to SR users.
export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-lg sm:rounded-2xl border border-stone-200 bg-white"
    >
      {/* Image area - same fixed heights as ProductCard (desktop lg: 20% shorter to match) */}
      <div className="relative h-[130px] min-[360px]:h-[150px] min-[480px]:h-[170px] sm:h-auto sm:aspect-square lg:aspect-[5/4] w-full overflow-hidden bg-white border-b border-stone-100">
        <div className="skeleton-shimmer absolute inset-0" />
        {/* Category badge placeholder */}
        <div className="absolute top-1 left-1 sm:top-2.5 sm:left-2.5">
          <div className="skeleton-shimmer h-[14px] w-14 sm:h-[18px] sm:w-20 rounded px-1 sm:px-2" />
        </div>
        {/* Rating badge placeholder */}
        <div className="absolute top-1 right-1 sm:top-2.5 sm:right-2.5">
          <div className="skeleton-shimmer h-[14px] w-10 sm:h-[18px] sm:w-12 rounded px-1 sm:px-2" />
        </div>
      </div>

      {/* Product Info - same padding and reserved heights as ProductCard */}
      <div className="flex min-w-0 flex-1 flex-col p-2 sm:p-4 lg:p-3">
        {/* Brand */}
        <div className="skeleton-shimmer h-2 w-1/3 rounded" />

        {/* Name - reserves 2 lines */}
        <div className="min-h-[30px] sm:min-h-[44px] lg:min-h-[40px]">
          <div className="skeleton-shimmer mt-1 h-2.5 w-11/12 rounded" />
          <div className="skeleton-shimmer mt-1 h-2.5 w-2/3 rounded" />
        </div>

        {/* Description - reserves 2 lines */}
        <div className="mt-0.5 sm:mt-1 lg:mt-0.5 min-h-[25px] sm:min-h-[39px] lg:min-h-[34px]">
          <div className="skeleton-shimmer h-2 w-full rounded" />
          <div className="skeleton-shimmer mt-1 h-2 w-4/5 rounded" />
        </div>

        {/* Price section - same reserved height as ProductCard */}
        <div className="mt-1 sm:mt-3 lg:mt-2 mb-1.5 sm:mb-4 lg:mb-2.5 min-w-0 min-h-[34px] sm:min-h-[48px] lg:min-h-[44px]">
          <div className="skeleton-shimmer h-3.5 w-16 rounded" />
          <div className="skeleton-shimmer mt-1 h-2 w-24 rounded" />
        </div>

        {/* Action buttons - pinned to bottom like ProductCard */}
        <div className="mt-auto flex sm:grid sm:grid-cols-2 gap-1.5 sm:gap-2 pt-1.5 sm:pt-1 border-t border-stone-100">
          <div className="skeleton-shimmer h-7 sm:h-[34px] rounded-md sm:rounded-lg" />
          <div className="skeleton-shimmer h-7 sm:h-[34px] flex-1 rounded-md sm:rounded-lg" />
        </div>
      </div>
    </div>
  );
}

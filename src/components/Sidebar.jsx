import React from 'react';
import { Filter, X, Sparkles, Tag, Layers } from 'lucide-react';

export default function Sidebar({
  selectedCategory = 'All',
  onSelectCategory,
  selectedPriceRange = 'all',
  onSelectPriceRange,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
  categories = [
    { id: 'All', name: 'All Products', count: 1 },
    { id: 'Skin Care', name: 'Skin Care', count: 1 },
    { id: 'Face Care', name: 'Face Care', count: 0 },
    { id: 'Body Care', name: 'Body Care', count: 0 },
    { id: 'Hair Care', name: 'Hair Care', count: 0 },
  ]
}) {
  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-500', label: 'Under ₹500', note: 'Affordable Essentials' },
    { id: '500-1000', label: '₹500 – ₹1,000' },
    { id: '1000-2000', label: '₹1,000 – ₹2,000' },
  ];

  const content = (
    <div className="space-y-6 text-slate-800">
      
      {/* 1. About 1TAP */}
      <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
          <Sparkles className="h-3.5 w-3.5 text-stone-700" />
          <span>About 1TAP</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          1TAP is an online store offering skincare, beauty and cosmetic products from multiple brands.
        </p>
      </div>

      {/* 2. Categories */}
      <div className="border-t border-stone-200/80 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
            <Layers className="h-3.5 w-3.5 text-slate-600" />
            <span>Categories</span>
          </h3>
        </div>

        <ul className="space-y-1.5 text-sm">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(cat.id);
                    if (onCloseMobileDrawer) onCloseMobileDrawer();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                    isActive
                      ? 'bg-slate-900 text-white font-medium shadow-2xs'
                      : 'text-slate-600 hover:bg-stone-100 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.count !== undefined && cat.count > 0 ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-800 text-slate-200' : 'bg-stone-200 text-slate-700'
                    }`}>
                      {cat.count}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">0</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 3. Filter By Price */}
      <div className="border-t border-stone-200/80 pt-5">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          <Tag className="h-3.5 w-3.5 text-slate-600" />
          <span>Filter by Price</span>
        </h3>

        <div className="space-y-2 text-sm">
          {priceRanges.map((range) => (
            <label
              key={range.id}
              className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-stone-100/80 cursor-pointer select-none transition"
            >
              <input
                type="radio"
                name="price_filter"
                value={range.id}
                checked={selectedPriceRange === range.id}
                onChange={() => onSelectPriceRange && onSelectPriceRange(range.id)}
                className="mt-0.5 h-4 w-4 text-slate-900 focus:ring-slate-900 accent-slate-900"
              />
              <div className="flex-1">
                <span className="text-xs font-medium text-slate-800 block">
                  {range.label}
                </span>
                {range.note && (
                  <span className="text-[11px] text-emerald-700 font-medium">
                    {range.note}
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Trust reassurance badge */}
      <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/60 p-3 text-[11px] text-emerald-800 leading-snug">
        ✓ 100% Genuine & Authentic Products<br />
        ✓ Cash on Delivery Available
      </div>


    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer (Collapsible) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobileDrawer}
          />
          
          {/* Drawer Body */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-900" />
                <span className="font-bold text-sm text-slate-900">Filters & Categories</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {content}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50">
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

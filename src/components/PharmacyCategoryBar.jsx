import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Pill,
  PillBottle,
  SoapDispenserDroplet,
  Sparkles,
  Scissors,
  Baby,
  Bandage,
  Stethoscope
} from 'lucide-react';

export const FOR_YOU_VALUE = 'for-you';

export const PHARMACY_CATEGORIES = [
  { name: 'For You', value: FOR_YOU_VALUE, Icon: Compass },
  { name: 'Medicines', value: 'Medicines', Icon: Pill },
  { name: 'Vitamins & Wellness', value: 'Vitamins & Wellness', Icon: PillBottle },
  { name: 'Personal Care', value: 'Personal Care', Icon: SoapDispenserDroplet },
  { name: 'Skin Care', value: 'Skin Care', Icon: Sparkles },
  { name: 'Hair Care', value: 'Hair Care', Icon: Scissors },
  { name: 'Baby Care', value: 'Baby Care', Icon: Baby },
  { name: 'First Aid', value: 'First Aid', Icon: Bandage },
  { name: 'Medical Devices', value: 'Medical Devices', Icon: Stethoscope }
];

export function normalizeCategoryValue(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

export function isForYouCategory(value) {
  const normalized = normalizeCategoryValue(value).replace(/\s+/g, '');
  return normalized === 'foryou';
}

function slugify(name) {
  return (name || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isActiveCategory(activeCategory, candidate) {
  if (!activeCategory || !candidate) return false;
  return normalizeCategoryValue(activeCategory) === normalizeCategoryValue(candidate);
}

/**
 * Flipkart-style horizontal pharmacy category navigation strip.
 * First tab is "For You", followed by 8 pharmacy categories.
 * Navigates to /products?category=<value>. "For You" uses ?category=for-you.
 */
export default function PharmacyCategoryBar({ activeCategory = '', onSelect }) {
  const navigate = useNavigate();

  const handleSelect = (categoryValue) => {
    if (onSelect) {
      onSelect(categoryValue);
      return;
    }
    navigate(`/products?category=${encodeURIComponent(categoryValue)}`);
  };

  return (
    <nav
      aria-label="Pharmacy categories"
      className="bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto py-2 sm:py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-9 lg:overflow-visible">
          {PHARMACY_CATEGORIES.map(({ name, value, Icon }) => {
            const active = isActiveCategory(activeCategory, value);
            return (
              <button
                key={value}
                id={`category-bar-${slugify(name)}`}
                type="button"
                aria-pressed={active}
                title={name}
                onClick={() => handleSelect(value)}
                className={`group flex w-[84px] sm:w-[104px] lg:w-auto shrink-0 flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition cursor-pointer ${
                  active
                    ? 'border-sky-600 bg-sky-50/80 ring-1 ring-sky-600/30'
                    : 'border-transparent hover:border-sky-200 hover:bg-sky-50/60'
                }`}
              >
                <span
                  className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border transition ${
                    active
                      ? 'bg-[#0b3b6f] border-[#0b3b6f] text-white'
                      : 'bg-[#eef4ff] border-sky-100 text-[#0b3b6f] group-hover:bg-sky-100 group-hover:border-sky-200'
                  }`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
                </span>
                <span
                  className={`text-[11px] sm:text-xs font-semibold leading-tight max-w-[92px] sm:max-w-[104px] ${
                    active ? 'text-sky-900' : 'text-slate-700 group-hover:text-slate-950'
                  }`}
                >
                  {name}
                </span>
                {active && (
                  <span className="h-1 w-6 rounded-full bg-emerald-500" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

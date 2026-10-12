import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Pill,
  HeartPulse,
  Sparkles,
  Award,
  CheckCircle2,
  PackageCheck,
  Truck,
  Droplets,
  Baby,
  Thermometer,
  Tag,
  Zap
} from 'lucide-react';

const ADVERTISEMENTS = [
  {
    id: 1,
    number: '01',
    category: 'Medicines & Rx',
    headline: 'Flat 20% OFF on Medicines',
    discountHighlight: 'FLAT 20% OFF',
    discountBadge: '⚡ MEGA PHARMACY SALE',
    supportingText: 'Genuine healthcare products from trusted brands.',
    cta: 'Shop Now',
    theme: {
      bgGradient: 'from-[#EBF8F4] via-[#F0FDF4] to-[#E0F2FE]',
      border: 'border-emerald-200/80',
      badgeBg: 'bg-emerald-600 text-white',
      accentColor: 'text-emerald-700',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30',
      previewBg: 'hover:bg-emerald-50/60',
      activePreview: 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/20 text-emerald-950',
      tagBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      glow: 'bg-emerald-400/20'
    },
    visualType: 'medicines_photo'
  },
  {
    id: 2,
    number: '02',
    category: 'Vitamins & Wellness',
    headline: 'Everyday Wellness, Better Prices',
    discountHighlight: 'UP TO 40% OFF',
    discountBadge: '⭐ NUTRITION & IMMUNITY',
    supportingText: 'Shop vitamins, supplements and everyday wellness essentials.',
    cta: 'Explore Now',
    theme: {
      bgGradient: 'from-[#FFF7ED] via-[#FEF3C7] to-[#ECFDF5]',
      border: 'border-amber-200/80',
      badgeBg: 'bg-amber-600 text-white',
      accentColor: 'text-amber-800',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30',
      previewBg: 'hover:bg-amber-50/60',
      activePreview: 'border-amber-600 bg-amber-50/90 ring-2 ring-amber-500/20 text-amber-950',
      tagBg: 'bg-amber-100 text-amber-800 border-amber-300',
      glow: 'bg-amber-400/20'
    },
    visualType: 'wellness_composition'
  },
  {
    id: 3,
    number: '03',
    category: 'Hygiene & Clean Care',
    headline: 'Personal Care Essentials',
    discountHighlight: 'MIN 30% OFF',
    discountBadge: '💧 DAILY HYGIENE SAVINGS',
    supportingText: 'Everything you need for your everyday personal care.',
    cta: 'Shop Now',
    theme: {
      bgGradient: 'from-[#ECFEFF] via-[#E0F2FE] to-[#F0FDFA]',
      border: 'border-cyan-200/80',
      badgeBg: 'bg-cyan-700 text-white',
      accentColor: 'text-cyan-800',
      buttonBg: 'bg-cyan-700 hover:bg-cyan-800 text-white shadow-cyan-700/30',
      previewBg: 'hover:bg-cyan-50/60',
      activePreview: 'border-cyan-600 bg-cyan-50/90 ring-2 ring-cyan-500/20 text-cyan-950',
      tagBg: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      glow: 'bg-cyan-400/20'
    },
    visualType: 'personalcare_composition'
  },
  {
    id: 4,
    number: '04',
    category: 'Mother & Baby',
    headline: 'Care for Your Little Ones',
    discountHighlight: 'STARTING ₹99',
    discountBadge: '🍼 BABY CARE FEST',
    supportingText: 'Baby care essentials from trusted brands.',
    cta: 'Explore Baby Care',
    theme: {
      bgGradient: 'from-[#EFF6FF] via-[#EEF2FF] to-[#FDF2F8]',
      border: 'border-blue-200/80',
      badgeBg: 'bg-blue-600 text-white',
      accentColor: 'text-blue-800',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30',
      previewBg: 'hover:bg-blue-50/60',
      activePreview: 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-500/20 text-blue-950',
      tagBg: 'bg-blue-100 text-blue-800 border-blue-300',
      glow: 'bg-blue-400/20'
    },
    visualType: 'babycare_composition'
  },
  {
    id: 5,
    number: '05',
    category: 'First Aid & Emergency',
    headline: 'First Aid Essentials',
    discountHighlight: 'FLAT 25% OFF',
    discountBadge: '🚑 EMERGENCY & CLINICAL',
    supportingText: 'Be prepared with everyday medical and first-aid supplies.',
    cta: 'Shop First Aid',
    theme: {
      bgGradient: 'from-[#FFF1F2] via-[#FEE2E2] to-[#F0F9FF]',
      border: 'border-rose-200/80',
      badgeBg: 'bg-rose-600 text-white',
      accentColor: 'text-rose-800',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30',
      previewBg: 'hover:bg-rose-50/60',
      activePreview: 'border-rose-600 bg-rose-50/90 ring-2 ring-rose-500/20 text-rose-950',
      tagBg: 'bg-rose-100 text-rose-800 border-rose-300',
      glow: 'bg-rose-400/20'
    },
    visualType: 'firstaid_composition'
  }
];

export default function PharmacyCarousel({ onCtaClick, onCategorySelect }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const timerRef = useRef(null);

  // Exact 5-second automatic rotation
  const ROTATION_INTERVAL = 5000;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % ADVERTISEMENTS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + ADVERTISEMENTS.length) % ADVERTISEMENTS.length);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (!isHovered) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, ROTATION_INTERVAL);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentSlide, isHovered, nextSlide]);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStartX(null);
  };

  const handleCtaAction = (slide) => {
    if (onCtaClick) {
      onCtaClick();
    }
  };

  const activeAd = ADVERTISEMENTS[currentSlide];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6" aria-label="Discover 1TAP Marketplace Offers">
      
      {/* SECTION HEADER WITH MARKETPLACE BRANDING */}
      <div className="flex items-center justify-between gap-4 mb-2 sm:mb-4">
        <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span>Discover 1TAP</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Pharmacy
            </span>
          </h1>
          <span className="text-xs text-slate-500 hidden md:inline-block font-medium">
            India's Trusted Online Pharmacy & Healthcare Store
          </span>
        </div>

      </div>

      {/* MAIN ADVERTISEMENT CAROUSEL CONTAINER */}
      <div
        className={`relative overflow-hidden rounded-3xl border ${activeAd.theme.border} shadow-xl shadow-slate-200/60 transition-all duration-500`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="Pharmacy Marketplace Deals"
      >
        {/* Slides Viewport - FIXED mobile height (h-[360px]) so rotation never
            shifts layout; every slide is absolutely positioned within it.
            sm/lg keep the original content-driven min-heights. */}
        <div className="relative h-[360px] sm:h-auto sm:min-h-[420px] lg:min-h-[440px] sm:flex sm:items-center">
          {ADVERTISEMENTS.map((ad, index) => {
            const isActive = index === currentSlide;

            return (
              <div
                key={ad.id}
                className={`w-full h-full bg-gradient-to-r ${ad.theme.bgGradient} transition-all duration-700 ease-out ${
                  isActive
                    ? 'opacity-100 absolute inset-0 sm:relative z-10 translate-x-0'
                    : 'opacity-0 absolute inset-0 pointer-events-none z-0 translate-x-6'
                }`}
                aria-hidden={!isActive}
              >
                {/* Ambient Soft Glow Accents */}
                <div className={`pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full ${ad.theme.glow} blur-3xl`} />
                <div className={`pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full ${ad.theme.glow} blur-3xl`} />

                <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-6 lg:gap-8 items-center px-3 py-2 sm:p-8 lg:p-12 h-full sm:h-auto min-h-0 sm:min-h-[420px] lg:min-h-[440px] overflow-hidden sm:overflow-visible">
                  
                  {/* LEFT COLUMN: E-COMMERCE OFFER & COPY */}
                  <div className="lg:col-span-6 xl:col-span-6 space-y-1.5 sm:space-y-4 text-left z-10">
                    
                    {/* Deal Badge & Tag - compact on mobile */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs font-black uppercase tracking-wider ${ad.theme.badgeBg} shadow-xs`}>
                        <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                        <span>{ad.discountBadge}</span>
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${ad.theme.tagBg}`}>
                        {ad.discountHighlight}
                      </span>
                    </div>

                    {/* Big Bold Marketplace Headline - compact + clamped on mobile only */}
                    <h2 className="text-lg sm:text-3xl lg:text-4xl xl:text-[42px] font-black text-slate-900 leading-[1.1] sm:leading-[1.15] tracking-tight line-clamp-2 sm:line-clamp-none">
                      {ad.headline}
                    </h2>

                    {/* Supporting Text */}
                    <p className="text-[13px] sm:text-base text-slate-700 leading-snug sm:leading-relaxed font-medium max-w-lg line-clamp-2 sm:line-clamp-none">
                      {ad.supportingText}
                    </p>

                    {/* Marketplace Trust Chips - compact single row on mobile */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5 sm:pt-1 text-[10px] sm:text-xs text-slate-700 font-semibold">
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/90 border border-slate-200/80 rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-2xs">
                        <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
                        <span>100% Genuine</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/90 border border-slate-200/80 rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-2xs">
                        <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-sky-600" />
                        <span>Fast Delivery</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/90 border border-slate-200/80 rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-2xs">
                        <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                        <span>Certified Pharmacy</span>
                      </div>
                    </div>

                    {/* Shop Now CTA Button */}
                    <div className="pt-1 sm:pt-3">
                      <button
                        type="button"
                        onClick={() => handleCtaAction(ad)}
                        className={`group inline-flex items-center justify-center gap-2 sm:gap-3 rounded-xl px-5 py-2.5 text-sm sm:px-7 sm:py-3.5 sm:text-base font-extrabold shadow-lg transition-all duration-200 active:scale-95 cursor-pointer ${ad.theme.buttonBg}`}
                      >
                        <span>{ad.cta}</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </button>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: RICH IMAGE-LED E-COMMERCE PRODUCT COMPOSITION */}
                  <div className="lg:col-span-6 xl:col-span-6 flex justify-center lg:justify-end items-center">
                    <div className="relative w-full max-w-lg lg:max-w-xl">

                      {/* ---------------- AD 1: MEDICINES REAL PHOTO COMPOSITION ---------------- */}
                      {ad.visualType === 'medicines_photo' && (
                        <div className="relative group">
                          {/* Main Commercial Photo */}
                          <div className="relative overflow-hidden rounded-2xl border-2 border-white/80 shadow-2xl shadow-emerald-900/15 bg-white aspect-[5/2] sm:aspect-[16/9]">
                            <img
                              src="/ad_medicines.jpg"
                              alt="Medicines and Healthcare Delivery Box"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                              }}
                              className="w-full h-full object-cover object-center transform group-hover:scale-102 transition-transform duration-500"
                            />
                            
                            {/* Floating Marketplace Badge */}
                            <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              <span>FLAT 20% OFF</span>
                            </div>

                            <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm shadow-md">
                              Prescription & OTC
                            </div>
                          </div>

                          {/* Decorative floating trust pill */}
                          <div className="hidden sm:flex absolute -bottom-3 -left-3 bg-white border border-emerald-200 rounded-xl px-3 py-1.5 shadow-lg items-center gap-2">
                            <PackageCheck className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-bold text-slate-800">Doorstep Dispatch</span>
                          </div>
                        </div>
                      )}

                      {/* ---------------- AD 2: WELLNESS & VITAMINS MARKETPLACE COMPOSITION ---------------- */}
                      {ad.visualType === 'wellness_composition' && (
                        <div className="relative p-0 sm:p-2">
                          <div className="relative rounded-2xl bg-gradient-to-br from-amber-500/10 via-white to-amber-100/50 border-2 border-white p-2.5 sm:p-6 shadow-xl shadow-amber-900/10 backdrop-blur-xs">
                            
                            {/* Top Banner Row */}
                            <div className="flex items-center justify-between mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-amber-200/60">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                                  <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-slate-900">Daily Health & Nutrition</div>
                                  <div className="hidden sm:block text-[10px] font-bold text-amber-700">Multivitamins • Omega 3 • Calcium</div>
                                </div>
                              </div>
                              <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                                UP TO 40% OFF
                              </span>
                            </div>

                            {/* Product Arrangement Cards */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                              
                              {/* Product 1: Multivitamin Bottle */}
                              <div className="rounded-xl bg-white border border-amber-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-amber-100 to-amber-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-7 h-11 bg-amber-800 rounded-sm shadow-md border-t-4 border-amber-600 flex flex-col items-center justify-center text-[7px] text-amber-100 font-bold p-0.5">
                                    <span>VITA</span>
                                    <span>DAILY</span>
                                  </div>
                                  <span className="absolute top-1 right-1 bg-amber-500 text-white text-[8px] font-black px-1 rounded">35% OFF</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Daily Multi</div>
                                <div className="text-[10px] font-extrabold text-amber-700">₹349 <span className="line-through text-slate-400 font-normal">₹540</span></div>
                              </div>

                              {/* Product 2: Omega 3 Gold */}
                              <div className="rounded-xl bg-white border border-amber-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-orange-100 to-amber-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-8 h-10 bg-amber-500/90 rounded-md shadow-md border border-amber-300 flex flex-col items-center justify-center text-[7px] text-amber-950 font-black p-0.5">
                                    <span>OMEGA</span>
                                    <span>1000mg</span>
                                  </div>
                                  <span className="absolute top-1 right-1 bg-orange-500 text-white text-[8px] font-black px-1 rounded">40% OFF</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Fish Oil Softgels</div>
                                <div className="text-[10px] font-extrabold text-amber-700">₹499 <span className="line-through text-slate-400 font-normal">₹850</span></div>
                              </div>

                              {/* Product 3: Vitamin C Effervescent */}
                              <div className="rounded-xl bg-white border border-amber-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-yellow-100 to-amber-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-5 h-12 bg-orange-600 rounded-full shadow-md border border-orange-300 flex flex-col items-center justify-center text-[6px] text-white font-black">
                                    <span>VIT C</span>
                                    <span>1000</span>
                                  </div>
                                  <span className="absolute top-1 right-1 bg-yellow-600 text-white text-[8px] font-black px-1 rounded">25% OFF</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Immunity Fizz</div>
                                <div className="text-[10px] font-extrabold text-amber-700">₹220 <span className="line-through text-slate-400 font-normal">₹300</span></div>
                              </div>

                            </div>

                            {/* Bottom assurance */}
                            <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-2.5 border-t border-amber-200/60 hidden sm:flex items-center justify-between text-[11px] text-slate-700 font-semibold">
                              <span className="flex items-center gap-1 text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" /> 100% Certified Formulations
                              </span>
                              <span className="font-bold text-amber-800">Top Rated Brands</span>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* ---------------- AD 3: PERSONAL CARE & HYGIENE COMPOSITION ---------------- */}
                      {ad.visualType === 'personalcare_composition' && (
                        <div className="relative p-0 sm:p-2">
                          <div className="relative rounded-2xl bg-gradient-to-br from-cyan-500/10 via-white to-cyan-100/50 border-2 border-white p-2.5 sm:p-6 shadow-xl shadow-cyan-900/10 backdrop-blur-xs">
                            
                            {/* Top Banner Row */}
                            <div className="flex items-center justify-between mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-cyan-200/60">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-cyan-700 text-white flex items-center justify-center font-bold shadow-xs">
                                  <Droplets className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-slate-900">Personal Hygiene & Sanitization</div>
                                  <div className="hidden sm:block text-[10px] font-bold text-cyan-700">Handwash • Antiseptics • Skin Care</div>
                                </div>
                              </div>
                              <span className="bg-cyan-700 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                                MIN 30% OFF
                              </span>
                            </div>

                            {/* Product Arrangement Cards */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                              
                              {/* Product 1: Antiseptic Liquid */}
                              <div className="rounded-xl bg-white border border-cyan-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-cyan-100 to-cyan-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-8 h-11 bg-cyan-700 rounded-sm shadow-md border-t-4 border-cyan-500 flex flex-col items-center justify-center text-[7px] text-cyan-100 font-bold p-0.5">
                                    <span>CLEAN</span>
                                    <span>CARE</span>
                                  </div>
                                  <span className="absolute top-1 right-1 bg-cyan-600 text-white text-[8px] font-black px-1 rounded">30% OFF</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Antiseptic Liquid</div>
                                <div className="text-[10px] font-extrabold text-cyan-800">₹145 <span className="line-through text-slate-400 font-normal">₹210</span></div>
                              </div>

                              {/* Product 2: Hygiene Handwash Pump */}
                              <div className="rounded-xl bg-white border border-cyan-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-teal-100 to-cyan-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-7 h-11 bg-teal-600 rounded-md shadow-md border-t-4 border-slate-700 flex flex-col items-center justify-center text-[7px] text-white font-bold p-0.5">
                                    <span>PUMP</span>
                                    <span>WASH</span>
                                  </div>
                                  <span className="absolute top-1 right-1 bg-teal-600 text-white text-[8px] font-black px-1 rounded">35% OFF</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Gentle Handwash</div>
                                <div className="text-[10px] font-extrabold text-cyan-800">₹99 <span className="line-through text-slate-400 font-normal">₹150</span></div>
                              </div>

                              {/* Product 3: Antibacterial Wipes */}
                              <div className="rounded-xl bg-white border border-cyan-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-blue-100 to-cyan-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-10 h-7 bg-blue-600 rounded-md shadow-md border-2 border-white flex items-center justify-center text-[7px] text-white font-black">
                                    <span>WIPES</span>
                                  </div>
                                  <span className="absolute top-1 right-1 bg-blue-600 text-white text-[8px] font-black px-1 rounded">40% OFF</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Hygiene Wipes</div>
                                <div className="text-[10px] font-extrabold text-cyan-800">₹120 <span className="line-through text-slate-400 font-normal">₹200</span></div>
                              </div>

                            </div>

                            {/* Bottom assurance */}
                            <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-2.5 border-t border-cyan-200/60 hidden sm:flex items-center justify-between text-[11px] text-slate-700 font-semibold">
                              <span className="flex items-center gap-1 text-cyan-800">
                                <ShieldCheck className="h-3.5 w-3.5" /> Dermatologist Approved
                              </span>
                              <span className="font-bold text-cyan-900">Hospital Grade Clean</span>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* ---------------- AD 4: BABY CARE MARKETPLACE COMPOSITION ---------------- */}
                      {ad.visualType === 'babycare_composition' && (
                        <div className="relative p-0 sm:p-2">
                          <div className="relative rounded-2xl bg-gradient-to-br from-blue-500/10 via-white to-pink-100/40 border-2 border-white p-2.5 sm:p-6 shadow-xl shadow-blue-900/10 backdrop-blur-xs">
                            
                            {/* Top Banner Row */}
                            <div className="flex items-center justify-between mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-blue-200/60">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                                  <Baby className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-slate-900">Mother & Baby Essentials</div>
                                  <div className="hidden sm:block text-[10px] font-bold text-blue-700">Gentle Lotions • Soft Diapers • Wipes</div>
                                </div>
                              </div>
                              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                                FROM ₹99
                              </span>
                            </div>

                            {/* Product Arrangement Cards */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                              
                              {/* Product 1: Gentle Baby Lotion */}
                              <div className="rounded-xl bg-white border border-blue-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-blue-100 to-sky-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-7 h-11 bg-blue-500 rounded-t-lg rounded-b-sm shadow-md border-t-3 border-white flex flex-col items-center justify-center text-[7px] text-white font-bold p-0.5">
                                    <span>BABY</span>
                                    <span>LOTION</span>
                                  </div>
                                  <span className="absolute top-1 right-1 bg-blue-500 text-white text-[8px] font-black px-1 rounded">20% OFF</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Baby Body Lotion</div>
                                <div className="text-[10px] font-extrabold text-blue-800">₹199 <span className="line-through text-slate-400 font-normal">₹250</span></div>
                              </div>

                              {/* Product 2: Soft Baby Diaper Pack */}
                              <div className="rounded-xl bg-white border border-blue-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-indigo-100 to-blue-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-9 h-10 bg-indigo-500 rounded-md shadow-md border-2 border-white flex flex-col items-center justify-center text-[7px] text-white font-black p-0.5">
                                    <span>DIAPERS</span>
                                    <span>PANTS</span>
                                  </div>
                                  <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[8px] font-black px-1 rounded">30% OFF</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Comfort Diapers</div>
                                <div className="text-[10px] font-extrabold text-blue-800">₹449 <span className="line-through text-slate-400 font-normal">₹650</span></div>
                              </div>

                              {/* Product 3: Pure Water Wipes */}
                              <div className="rounded-xl bg-white border border-blue-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-pink-100 to-blue-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-10 h-7 bg-pink-400 rounded-md shadow-md border-2 border-white flex items-center justify-center text-[7px] text-white font-black">
                                    <span>SOFT WIPES</span>
                                  </div>
                                  <span className="absolute top-1 right-1 bg-pink-500 text-white text-[8px] font-black px-1 rounded">From ₹99</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Pure Baby Wipes</div>
                                <div className="text-[10px] font-extrabold text-blue-800">₹99 <span className="line-through text-slate-400 font-normal">₹150</span></div>
                              </div>

                            </div>

                            {/* Bottom assurance */}
                            <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-2.5 border-t border-blue-200/60 hidden sm:flex items-center justify-between text-[11px] text-slate-700 font-semibold">
                              <span className="flex items-center gap-1 text-blue-800">
                                <ShieldCheck className="h-3.5 w-3.5" /> 100% Mild & Hypoallergenic
                              </span>
                              <span className="font-bold text-blue-900">Pediatric Tested</span>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* ---------------- AD 5: FIRST AID & EMERGENCY SUPPLIES COMPOSITION ---------------- */}
                      {ad.visualType === 'firstaid_composition' && (
                        <div className="relative p-0 sm:p-2">
                          <div className="relative rounded-2xl bg-gradient-to-br from-rose-500/10 via-white to-rose-100/50 border-2 border-white p-2.5 sm:p-6 shadow-xl shadow-rose-900/10 backdrop-blur-xs">
                            
                            {/* Top Banner Row */}
                            <div className="flex items-center justify-between mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-rose-200/60">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
                                  <Thermometer className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-slate-900">Emergency & Home Medical Care</div>
                                  <div className="hidden sm:block text-[10px] font-bold text-rose-700">Thermometers • First Aid Kits • Bandages</div>
                                </div>
                              </div>
                              <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                                FLAT 25% OFF
                              </span>
                            </div>

                            {/* Product Arrangement Cards */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                              
                              {/* Product 1: Digital Thermometer */}
                              <div className="rounded-xl bg-white border border-rose-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-rose-100 to-red-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-4 h-12 bg-white rounded-full shadow-md border border-slate-300 flex flex-col items-center justify-center text-[7px] text-slate-900 font-black p-0.5">
                                    <div className="w-2.5 h-3 bg-emerald-100 border border-emerald-400 rounded-xs text-[5px] text-emerald-800 font-mono flex items-center justify-center">
                                      37.0
                                    </div>
                                  </div>
                                  <span className="absolute top-1 right-1 bg-rose-600 text-white text-[8px] font-black px-1 rounded">25% OFF</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Digital Temp</div>
                                <div className="text-[10px] font-extrabold text-rose-700">₹185 <span className="line-through text-slate-400 font-normal">₹250</span></div>
                              </div>

                              {/* Product 2: First Aid Medical Box */}
                              <div className="rounded-xl bg-white border border-rose-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-red-100 to-rose-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-10 h-8 bg-red-600 rounded-md shadow-md border-2 border-white flex flex-col items-center justify-center text-white font-black">
                                    <span className="text-xs">+</span>
                                    <span className="text-[6px]">FIRST AID</span>
                                  </div>
                                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-black px-1 rounded">30% OFF</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Emergency Kit</div>
                                <div className="text-[10px] font-extrabold text-rose-700">₹399 <span className="line-through text-slate-400 font-normal">₹570</span></div>
                              </div>

                              {/* Product 3: Bandage & Antiseptic Roll */}
                              <div className="rounded-xl bg-white border border-rose-200 p-2 sm:p-2.5 text-center shadow-xs hover:-translate-y-1 transition-transform">
                                <div className="h-10 sm:h-16 w-full rounded-lg bg-gradient-to-b from-sky-100 to-rose-50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                                  <div className="w-8 h-8 rounded-full border-4 border-amber-300 bg-white flex items-center justify-center text-[7px] text-slate-800 font-bold shadow-xs">
                                    GAUZE
                                  </div>
                                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black px-1 rounded">20% OFF</span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">Sterile Dressing</div>
                                <div className="text-[10px] font-extrabold text-rose-700">₹75 <span className="line-through text-slate-400 font-normal">₹95</span></div>
                              </div>

                            </div>

                            {/* Bottom assurance */}
                            <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-2.5 border-t border-rose-200/60 hidden sm:flex items-center justify-between text-[11px] text-slate-700 font-semibold">
                              <span className="flex items-center gap-1 text-rose-800">
                                <ShieldCheck className="h-3.5 w-3.5" /> Clinical Sterility Sealed
                              </span>
                              <span className="font-bold text-rose-900">Hospital Grade</span>
                            </div>

                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* CAROUSEL CONTROLS (ARROWS & 5 PAGINATION DOTS) */}
        <div className="relative border-t border-slate-200/70 bg-white/80 px-4 sm:px-6 py-2 sm:py-2.5 backdrop-blur-md flex items-center justify-between">
          
          {/* Previous Arrow Button */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Advertisement"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 border border-slate-200 shadow-xs transition active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* 5 Pagination Dots */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Advertisement Slides">
            {ADVERTISEMENTS.map((ad, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={ad.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Ad ${idx + 1}: ${ad.headline}`}
                  onClick={() => goToSlide(idx)}
                  className={`relative h-2 sm:h-2.5 transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? 'w-7 sm:w-9 bg-slate-900 shadow-xs'
                      : 'w-2 sm:w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              );
            })}
          </div>

          {/* Next Arrow Button */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Advertisement"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 border border-slate-200 shadow-xs transition active:scale-90 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

        </div>
      </div>

    </section>
  );
}


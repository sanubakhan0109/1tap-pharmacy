import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Star, Ban } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  if (!product) return null;

  const isOutOfStock = product.isOutOfStock || product.status === 'Out of Stock' || product.stock <= 0;
  const productIdentifier = product.slug || product.id;
  const productImage = product.imageUrl || product.image;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  return (
    <div className="group relative flex h-full min-w-0 w-full flex-col overflow-hidden rounded-lg sm:rounded-2xl border border-stone-200 bg-white transition-all duration-200 hover:border-stone-300 hover:shadow-md">
      
      {/* Product Image - desktop (lg: 1024px+): 20% shorter via 5/4 aspect, mobile/tablet unchanged */}
      <Link
        to={`/products/${productIdentifier}`}
        className="relative block h-[130px] min-[360px]:h-[150px] min-[480px]:h-[170px] sm:h-auto sm:aspect-square lg:aspect-[5/4] w-full overflow-hidden bg-white border-b border-stone-100"
      >
        <img
          src={productImage}
          alt={`${product.name} - buy online at 1TAP Pharmacy`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/1tap-pharmacy-logo.png';
          }}
          className={`h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'opacity-70 grayscale-30' : ''
          }`}
          loading="lazy"
          decoding="async"
        />
        
        {/* Category Badge */}
        <div className="absolute top-1 left-1 sm:top-2.5 sm:left-2.5">
          <span className="inline-flex items-center rounded px-1 sm:px-2 py-px sm:py-0.5 text-[9px] sm:text-[11px] font-bold text-slate-800 shadow-2xs border border-stone-200 bg-white/95 backdrop-blur-xs max-w-[90px] sm:max-w-none truncate">
            {product.category}
          </span>
        </div>

        {/* Rating or Out of Stock Badge */}
        <div className="absolute top-1 right-1 sm:top-2.5 sm:right-2.5">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-0.5 sm:gap-1 rounded bg-rose-50 px-1 sm:px-2 py-px sm:py-0.5 text-[9px] sm:text-[11px] font-bold text-rose-800 border border-rose-200/80 shadow-2xs">
              <Ban className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-rose-600" />
              <span>Out of Stock</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 sm:gap-1 rounded bg-emerald-50 px-1 sm:px-2 py-px sm:py-0.5 text-[9px] sm:text-[11px] font-bold text-emerald-800 border border-emerald-200/80 shadow-2xs">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-emerald-600 text-emerald-600" />
              <span>4.9</span>
            </span>
          )}
        </div>
      </Link>

      {/* Product Info - desktop: slightly tighter padding, mobile/tablet unchanged */}
      <div className="flex min-w-0 flex-1 flex-col p-2 sm:p-4 lg:p-3">
        
        {/* Brand */}
        <p className="text-[9px] sm:text-[11px] font-semibold text-amber-800 tracking-wide uppercase line-clamp-1">
          {product.brand || 'Featured Brand'}
        </p>

        {/* Name - reserves 2 lines so short names leave empty space (desktop: slightly less reserve) */}
        <h3 className="text-xs sm:text-base font-bold text-slate-900 line-clamp-2 leading-tight sm:leading-snug min-h-[30px] sm:min-h-[44px] lg:min-h-[40px] group-hover:text-slate-700 transition">
          <Link to={`/products/${productIdentifier}`}>{product.name}</Link>
        </h3>

        {/* Short Description - reserves 2 lines (desktop: tighter margin + reserve, still line-clamp-2) */}
        <p className="mt-0.5 sm:mt-1 lg:mt-0.5 text-[10px] sm:text-xs text-slate-500 line-clamp-2 leading-tight sm:leading-relaxed min-h-[25px] sm:min-h-[39px] lg:min-h-[34px]">
          {product.shortDescription || product.description}
        </p>

        {/* Pricing Row - fixed area so missing MRP never shifts layout (desktop: tighter margins) */}
        <div className="mt-1 sm:mt-3 lg:mt-2 mb-1.5 sm:mb-4 lg:mb-2.5 min-w-0 min-h-[34px] sm:min-h-[48px] lg:min-h-[44px]">
          <div className="flex min-w-0 items-baseline gap-1 sm:gap-1.5">
            <span className="text-[13px] sm:text-lg font-black text-slate-950 whitespace-nowrap">
              {product.formattedPrice || `₹${product.price}`}
            </span>
            {product.formattedOriginalPrice && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through truncate">
                {product.formattedOriginalPrice}
              </span>
            )}
          </div>
          <div className="mt-px sm:mt-1 lg:mt-0.5 flex items-center justify-between gap-1 text-[9px] sm:text-[11px] whitespace-nowrap">
            <span className="text-emerald-700 font-bold truncate">
              Free Delivery
            </span>
            <span className="text-slate-400 font-medium shrink-0">COD</span>
          </div>
        </div>

        {/* Action Buttons - pinned to card bottom via mt-auto */}
        <div className="mt-auto flex sm:grid sm:grid-cols-2 gap-1.5 sm:gap-2 pt-1.5 sm:pt-1 border-t border-stone-100">
          <Link
            to={`/products/${productIdentifier}`}
            id={`view-details-${product.id}`}
            aria-label="View details"
            className="inline-flex items-center justify-center gap-1.5 rounded-md sm:rounded-lg border border-stone-300 bg-stone-50 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-700 transition hover:bg-stone-100 hover:text-slate-900 active:scale-95"
          >
            <Eye className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 shrink-0 text-slate-500" />
            <span className="hidden sm:inline">Details</span>
          </Link>

          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-md sm:rounded-lg bg-stone-200 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-stone-500 cursor-not-allowed opacity-80 whitespace-nowrap"
            >
              <span>Out of Stock</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              id={`add-to-cart-${product.id}`}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-md sm:rounded-lg bg-slate-950 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white shadow-2xs transition hover:bg-slate-800 active:scale-95 whitespace-nowrap"
            >
              <ShoppingBag className="hidden min-[360px]:block sm:block h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

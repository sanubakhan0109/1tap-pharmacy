import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { usePageMeta } from '../utils/seo';
import QuantitySelector from '../components/QuantitySelector';
import { ProductDetailsSkeleton } from '../components/skeletons';
import {
  ShoppingBag,
  ArrowLeft,
  Check,
  Truck,
  ShieldCheck,
  RefreshCw,
  Star,
  Ban,
  Sparkles
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  usePageMeta({
    title: product ? `${product.name} (${product.brand || '1TAP'})` : 'Product Details',
    description: product
      ? `${product.name} - ${product.formattedPrice || `₹${product.price}`}. ${(product.shortDescription || '').slice(0, 140)} Free delivery and Cash on Delivery across India.`
      : 'View product details, price and availability at 1TAP Pharmacy.',
    path: `/products/${id}`,
    image: product?.imageUrl || product?.image,
  });

  useEffect(() => {
    let isMounted = true;
    const loadProduct = async () => {
      setLoading(true);
      const data = await fetchPublicProductById(id);
      if (isMounted) {
        setProduct(data);
        setLoading(false);
      }
    };
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Product structured data from live catalog values only (no ratings/reviews).
  useEffect(() => {
    if (!product) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'product-jsonld';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      brand: { '@type': 'Brand', name: product.brand || '1TAP' },
      category: product.category,
      description: (product.shortDescription || '').slice(0, 500),
      image: product.imageUrl || product.image,
      offers: {
        '@type': 'Offer',
        url: window.location.href,
        priceCurrency: 'INR',
        price: Number(product.price) || 0,
        availability: product.isOutOfStock
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      },
    });
    document.head.appendChild(script);
    return () => {
      document.getElementById('product-jsonld')?.remove();
    };
  }, [product]);

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    if (!product || product.isOutOfStock) return;
    addToCart(product, quantity);
  };

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for does not exist or is currently unavailable.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Browse All Products</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.isOutOfStock || product.status === 'Out of Stock' || product.stock <= 0;
  const productImage = product.imageUrl || product.image;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-16">
      
      {/* Breadcrumb / Back Link */}
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Two Column Product Presentation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
        
        {/* Left: Product Image */}
        <div className="md:col-span-5 flex justify-center">
          <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            <img
              src={productImage}
              alt={`${product.name} by ${product.brand || '1TAP'} - buy online at 1TAP Pharmacy`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/1tap-pharmacy-logo.png';
              }}
              className={`h-full w-full object-cover object-center ${
                isOutOfStock ? 'opacity-75 grayscale-30' : ''
              }`}
              decoding="async"
            />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center rounded-md bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs border border-stone-200">
                {product.category}
              </span>
            </div>

            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] flex items-center justify-center">
                <span className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Info & Purchase Actions */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200/80">
                <Star className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
                <span>4.9 (Verified Quality)</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">• Brand: <span className="font-bold text-slate-800">{product.brand || 'Featured Brand'}</span></span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {product.name}
            </h1>
            
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-2xl font-black text-slate-950">
                {product.formattedPrice || `₹${product.price}`}
              </span>
              {product.formattedOriginalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {product.formattedOriginalPrice}
                </span>
              )}
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Free COD Available
              </span>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
              Description
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.fullDescription || product.shortDescription || product.description}
            </p>
          </div>

          {/* Highlights / Benefits */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="space-y-1.5 rounded-xl bg-stone-50 p-3.5 border border-stone-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                Product Benefits
              </h3>
              <div className="space-y-1">
                {product.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skincare Details / How to use */}
          {product.howToUse && (
            <div className="border-t border-stone-100 pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                How To Use
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.howToUse}
              </p>
            </div>
          )}

          {/* Quantity and Add to Cart Button */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Quantity
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <QuantitySelector
                quantity={quantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                min={1}
                disabled={isOutOfStock}
              />

              {isOutOfStock ? (
                <button
                  type="button"
                  disabled
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-stone-200 px-6 py-3 text-xs font-bold text-stone-500 cursor-not-allowed"
                >
                  <Ban className="h-4 w-4" />
                  <span>Currently Out of Stock</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="product-details-add-to-cart"
                  onClick={handleAddToCart}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-xs font-bold text-white shadow-2xs transition hover:bg-slate-800 active:scale-95"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart • ₹{product.price * quantity}</span>
                </button>
              )}
            </div>
          </div>

          {/* Reassurance Grid */}
          <div className="grid grid-cols-3 gap-2 border-t border-stone-100 pt-4 text-center text-[11px] text-slate-600">
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-stone-50/70 border border-stone-100">
              <Truck className="h-3.5 w-3.5 text-slate-800" />
              <span className="font-semibold">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-stone-50/70 border border-stone-100">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-800" />
              <span className="font-semibold">100% Genuine</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-stone-50/70 border border-stone-100">
              <RefreshCw className="h-3.5 w-3.5 text-slate-800" />
              <span className="font-semibold">Cash on Delivery</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

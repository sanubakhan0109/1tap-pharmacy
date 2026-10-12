import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchPublicProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/skeletons';
import Sidebar from '../components/Sidebar';
import PharmacyCategoryBar, { FOR_YOU_VALUE, isForYouCategory } from '../components/PharmacyCategoryBar';
import { Filter, PackageCheck } from 'lucide-react';
import { usePageMeta } from '../utils/seo';

export default function Products() {
  usePageMeta({
    title: 'Shop All Products',
    description: 'Browse genuine skincare, beauty and healthcare products from trusted brands at 1TAP Pharmacy. Free delivery and Cash on Delivery across India.',
    path: '/products',
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQueryParam = searchParams.get('search') || searchParams.get('q') || '';
  const categoryParam = (searchParams.get('category') || '').trim();
  // Default tab is "For You" when no category is in the URL.
  const effectiveCategory = categoryParam || FOR_YOU_VALUE;
  const normalizedEffectiveCategory = effectiveCategory.toLowerCase();
  const showingForYou = isForYouCategory(effectiveCategory);

  // Reflect the default "For You" state in the URL on plain /products visits.
  useEffect(() => {
    if (!categoryParam && !searchQueryParam.trim()) {
      setSearchParams({ category: FOR_YOU_VALUE });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryBarSelect = (categoryName) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (categoryName && categoryName.trim()) {
        next.set('category', categoryName.trim());
      } else {
        next.delete('category');
      }
      return next;
    });
  };

  const handleClearCategory = () => {
    // Back to the default "For You" feed.
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('category', FOR_YOU_VALUE);
      return next;
    });
  };

  const handleClearSearch = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      next.delete('q');
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchPublicProducts();
      if (isMounted) {
        setProducts(data);
        setLoading(false);
      }
    };
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute category counts dynamically
  const categoriesList = [
    { id: 'All', name: 'All Products', count: products.length },
    {
      id: 'Skin Care',
      name: 'Skin Care',
      count: products.filter((p) => p.category === 'Skin Care').length
    },
    {
      id: 'Face Care',
      name: 'Face Care',
      count: products.filter((p) => p.category === 'Face Care').length
    },
    {
      id: 'Body Care',
      name: 'Body Care',
      count: products.filter((p) => p.category === 'Body Care').length
    },
    {
      id: 'Hair Care',
      name: 'Hair Care',
      count: products.filter((p) => p.category === 'Hair Care').length
    }
  ];

  // Filter products by search term, category and price
  const filteredProducts = products.filter((product) => {
    // 0. Search Term Filter
    if (searchQueryParam.trim()) {
      const term = searchQueryParam.trim().toLowerCase();
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const brand = (product.brand || '').toLowerCase();
      const sku = (product.sku || '').toLowerCase();
      const desc = (product.shortDescription || product.fullDescription || '').toLowerCase();
      const matchesSearch =
        name.includes(term) ||
        category.includes(term) ||
        brand.includes(term) ||
        sku.includes(term) ||
        desc.includes(term);
      if (!matchesSearch) return false;
    }
    // 1. Category Filter ("For You" = recommended feed: active, in-stock,
    // recently-added-first from the service; other tabs match Supabase
    // category case-insensitively)
    if (showingForYou) {
      if (product.isOutOfStock) return false;
    } else if (normalizedEffectiveCategory) {
      const productCategory = (product.category || '').toLowerCase();
      if (productCategory !== normalizedEffectiveCategory) return false;
    } else if (selectedCategory !== 'All' && (product.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    // 2. Price Filter
    if (selectedPriceRange === 'under-500' && product.price > 500) {
      return false;
    }
    if (selectedPriceRange === '500-1000' && (product.price < 500 || product.price > 1000)) {
      return false;
    }
    if (selectedPriceRange === '1000-2000' && (product.price < 1000 || product.price > 2000)) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen pb-16">
      {/* Pharmacy category navigation strip (same tabs as homepage, For You first) */}
      <PharmacyCategoryBar
        activeCategory={effectiveCategory}
        onSelect={handleCategoryBarSelect}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Header & Mobile Filter Toggle */}
      <div className="flex items-center justify-between border-b border-stone-200/90 pb-4 mb-6">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
            {searchQueryParam.trim()
              ? `Search: "${searchQueryParam.trim()}"`
              : showingForYou
                ? 'For You'
                : effectiveCategory}
          </h1>
          <span className="rounded-md bg-stone-200/80 px-2 py-0.5 text-xs font-bold text-slate-700">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
          </span>
          {!showingForYou && categoryParam && (
            <button
              type="button"
              onClick={handleClearCategory}
              className="text-xs text-sky-700 hover:text-sky-800 font-semibold underline ml-1 cursor-pointer"
            >
              Clear Category
            </button>
          )}
          {searchQueryParam.trim() && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline ml-1 cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-stone-50"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filters & Categories</span>
        </button>
      </div>

      {/* 2-Column Marketplace Grid (Sidebar + Product Catalog) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sidebar */}
        <Sidebar
          categories={categoriesList}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedPriceRange={selectedPriceRange}
          onSelectPriceRange={setSelectedPriceRange}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
        />

        {/* Right Product Grid */}
        <main className="flex-1 w-full min-w-0">
          {loading ? (
            <ProductGridSkeleton count={6} label="Loading products" />
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-3">
              <p className="text-sm font-bold text-slate-800">
                {searchQueryParam.trim()
                  ? `No products found matching "${searchQueryParam.trim()}".`
                  : showingForYou
                    ? 'No recommended products available right now.'
                    : `No products found in "${effectiveCategory}".`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedPriceRange('all');
                  setSearchParams({ category: FOR_YOU_VALUE });
                }}
                className="inline-flex rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-2xs cursor-pointer"
              >
                {searchQueryParam.trim() ? 'View All Products' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50/60 p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <PackageCheck className="h-4 w-4 text-emerald-600" />
            <span>Fast Doorstep Delivery • Cash on Delivery Available Across India</span>
          </div>
        </main>

      </div>
      </div>
    </div>
  );
}

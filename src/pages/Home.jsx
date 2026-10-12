import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicProducts } from '../services/productService';
import { usePageMeta } from '../utils/seo';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/skeletons';
import Sidebar from '../components/Sidebar';
import PharmacyCategoryBar from '../components/PharmacyCategoryBar';
import PharmacyCarousel from '../components/PharmacyCarousel';
import {
  Filter,
  PackageCheck
} from 'lucide-react';

export default function Home() {
  usePageMeta({
    title: 'Skincare, Beauty & Healthcare Essentials',
    description: 'Shop genuine skincare, beauty and healthcare essentials from trusted brands at 1TAP Pharmacy. Free doorstep delivery and Cash on Delivery across India.',
    path: '/',
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const productsSectionRef = useRef(null);

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

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }
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

      {/* 0. HORIZONTAL PHARMACY CATEGORY NAVIGATION (above Discover ads) */}
      <PharmacyCategoryBar />

      {/* 1. PROFESSIONAL PHARMACY PROMOTIONAL CAROUSEL */}
      <PharmacyCarousel onCtaClick={scrollToProducts} />

      {/* 2. MAIN SHOPPING / MARKETPLACE AREA */}
      <div
        ref={productsSectionRef}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-8"
      >
        
        {/* Marketplace Header & Mobile Filter Toggle */}
        <div className="flex items-center justify-between border-b border-stone-200/90 pb-5 mb-8">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
              Shop Our Products
            </h2>
            <span className="rounded-md bg-stone-200/80 px-2 py-0.5 text-xs font-bold text-slate-700">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </span>
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
                <p className="text-sm font-bold text-slate-800">No products available in this category.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedPriceRange('all');
                  }}
                  className="inline-flex rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-2xs"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Marketplace Assurance Strip */}
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

import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Menu,
  X,
  User,
  Package,
  LogOut,
  ChevronDown,
  Search,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { searchPublicProducts } from '../services/productService';
import { SearchDropdownSkeleton } from './skeletons';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const { cartCount } = useCart();
  const { customerUser, customerProfile, logout } = useCustomerAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setSearchDropdownOpen(false);
  };

  // Live debounced search against Supabase products
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchPublicProducts(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
        setSearchDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    closeMobileMenu();
    await logout();
    navigate('/');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchDropdownOpen(false);
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSearchDropdownOpen(false);
    closeMobileMenu();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleSelectSearchResult = (productId) => {
    setSearchDropdownOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    closeMobileMenu();
    navigate(`/products/${productId}`);
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-3.5 py-1.5 text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 rounded-lg ${
      isActive
        ? 'text-slate-950 font-semibold bg-stone-100/90 shadow-2xs'
        : 'text-stone-600 hover:text-slate-950 hover:bg-stone-50/80'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
      isActive
        ? 'bg-slate-950 text-white font-semibold'
        : 'text-slate-700 hover:bg-stone-100'
    }`;

  // Customer display name
  const rawEmailUsername = customerUser?.email?.split('@')[0] || '';
  const displayName =
    customerProfile?.full_name ||
    customerUser?.user_metadata?.full_name ||
    customerUser?.user_metadata?.name ||
    rawEmailUsername ||
    'Account';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* ================= LEFT: Brand / Logo ================= */}
        <div className="flex items-center shrink-0">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="group flex items-center gap-2.5 transition"
          >
            <img
              src="/1tap-pharmacy-logo.png"
              alt="1TAP Pharmacy Logo"
              fetchPriority="high"
              decoding="async"
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-full shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105"
            />
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-950 group-hover:opacity-90 transition">
              1TAP
            </span>
            <span className="text-stone-300 font-light text-base select-none">|</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-stone-500 font-semibold group-hover:text-stone-800 transition">
              COSMETICS
            </span>
          </Link>
        </div>

        {/* ================= MIDDLE: Search Bar (Stretching from beside COSMETICS) ================= */}
        <div className="hidden md:flex flex-1 max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg ml-3 lg:ml-6 mr-2 relative" ref={searchContainerRef}>
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full flex items-center"
            role="search"
          >
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute left-3 text-stone-400 hover:text-slate-900 transition p-0.5 z-10 flex items-center justify-center cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!searchDropdownOpen) setSearchDropdownOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setSearchDropdownOpen(true);
              }}
              placeholder="Search for products by name, category, brand..."
              className="w-full rounded-xl border border-stone-200/90 bg-stone-100/70 hover:bg-stone-100 pl-9.5 pr-8 py-1.5 text-xs text-slate-900 placeholder-stone-400 outline-none transition-all duration-200 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 text-stone-400 hover:text-stone-600 p-0.5 rounded-full hover:bg-stone-200/60 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Desktop Search Dropdown Panel */}
          {searchDropdownOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 w-full min-w-[320px] rounded-2xl border border-stone-200 bg-white p-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 z-50">
              {isSearching ? (
                <SearchDropdownSkeleton rows={3} />
              ) : searchResults.length === 0 ? (
                <div className="py-6 px-3 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-900">No products found</p>
                  <p className="text-[11px] text-stone-500">
                    No matches found for "{searchQuery}".
                  </p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                  <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    <span>Matching Products ({searchResults.length})</span>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-slate-900 hover:underline capitalize font-semibold tracking-normal text-[11px] cursor-pointer"
                    >
                      View all results &rarr;
                    </button>
                  </div>
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(product.id)}
                      className="w-full flex items-center gap-3 p-2 text-left rounded-xl hover:bg-stone-50 transition group cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/1tap-pharmacy-logo.png';
                        }}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover border border-stone-200 bg-stone-50"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-slate-950">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">
                          {product.category} {product.brand ? `• ${product.brand}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-950">
                          {product.formattedPrice || `₹${product.price}`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= RIGHT GROUP: Nav Links (Home, Products) + Account & Cart ================= */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          
          {/* Main Navigation (Home -> Products) */}
          <nav className="hidden md:flex items-center space-x-1 sm:space-x-1.5">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>
          </nav>

          {/* Vertical subtle divider on desktop */}
          <div className="hidden md:block h-4 w-[1px] bg-stone-200" />

          {/* ================= FAR RIGHT: Customer Account Dropdown & Cart ================= */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Customer Account Dropdown */}
            {customerUser ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  type="button"
                  id="customer-account-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:border-stone-300 hover:bg-stone-50 active:scale-95 shadow-2xs cursor-pointer"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[10px] text-white font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate font-medium">👤 {displayName}</span>
                  <ChevronDown className="h-3 w-3 text-stone-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-52 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100 z-50">
                    <div className="px-3 py-2 border-b border-stone-100 text-xs">
                      <p className="font-bold text-slate-950 truncate">👤 {displayName}</p>
                      <p className="text-[11px] text-stone-500 truncate">{customerUser.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      id="menu-my-profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-100 hover:text-slate-950 transition"
                    >
                      <User className="h-3.5 w-3.5 text-stone-500" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/orders"
                      id="menu-my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-100 hover:text-slate-950 transition"
                    >
                      <Package className="h-3.5 w-3.5 text-stone-500" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/orders"
                      id="menu-track-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-100 hover:text-slate-950 transition"
                    >
                      <Truck className="h-3.5 w-3.5 text-stone-500" />
                      <span>Track Orders</span>
                    </Link>

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      type="button"
                      id="customer-logout-btn"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                id="nav-signin-btn"
                className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-stone-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-stone-300 hover:bg-stone-50 active:scale-95 shadow-2xs"
              >
                <User className="h-3.5 w-3.5 text-stone-700" />
                <span>Sign In / Register</span>
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              onClick={closeMobileMenu}
              aria-label="Shopping Cart"
              id="nav-cart-btn"
              className="group relative flex items-center gap-2 rounded-xl border border-stone-200/90 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 transition hover:border-stone-300 hover:bg-stone-50 active:scale-95 shadow-2xs"
            >
              <ShoppingBag className="h-4 w-4 text-slate-800 transition group-hover:scale-105" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-stone-700">Cart</span>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-950 px-1.5 text-[11px] font-bold text-white shadow-2xs">
                {cartCount}
              </span>
            </Link>

            {/* Mobile hamburger menu button */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
              id="mobile-menu-toggle"
              className="inline-flex md:hidden items-center justify-center rounded-xl p-1.5 text-stone-700 hover:bg-stone-100 hover:text-slate-900 focus:outline-none transition cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= Mobile Drawer / Dropdown ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200/80 bg-white/98 backdrop-blur-md px-4 py-3.5 shadow-lg space-y-2 animate-in slide-in-from-top-2 duration-150">
          
          {/* Mobile Search Input */}
          <div className="pb-2 border-b border-stone-100">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center"
              role="search"
            >
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute left-3 text-stone-400 hover:text-slate-900 transition p-0.5 z-10 flex items-center justify-center cursor-pointer"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products by name, category, brand..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/80 pl-9.5 pr-8 py-2 text-xs text-slate-900 placeholder-stone-400 outline-none focus:border-slate-900 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-2.5 text-stone-400 p-0.5 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            {/* Mobile Search Results */}
            {searchQuery.trim() && (
              <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-stone-200 bg-white p-2">
                {isSearching ? (
                  <SearchDropdownSkeleton rows={3} />
                ) : searchResults.length === 0 ? (
                  <div className="py-4 text-center text-xs text-stone-500">
                    No products found
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      <span>Matching Products ({searchResults.length})</span>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-slate-900 hover:underline capitalize font-semibold tracking-normal text-[10px] cursor-pointer"
                      >
                        View all &rarr;
                      </button>
                    </div>
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectSearchResult(product.id)}
                        className="w-full flex items-center gap-2.5 py-2 text-left hover:bg-stone-50 rounded-lg px-1 transition cursor-pointer"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/1tap-pharmacy-logo.png';
                          }}
                          className="h-8 w-8 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-50"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
                          <p className="text-[10px] text-stone-500 truncate">
                            {product.category} {product.brand ? `• ${product.brand}` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-slate-900">
                            {product.formattedPrice || `₹${product.price}`}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <NavLink to="/" end onClick={closeMobileMenu} className={mobileNavLinkClass}>
            Home
          </NavLink>
          <NavLink to="/products" onClick={closeMobileMenu} className={mobileNavLinkClass}>
            Products
          </NavLink>
          <NavLink to="/cart" onClick={closeMobileMenu} className={mobileNavLinkClass}>
            Cart ({cartCount})
          </NavLink>

          <div className="border-t border-stone-200 my-2 pt-2" />

          {customerUser ? (
            <>
              <div className="px-4 py-1 text-xs font-bold text-stone-500 uppercase tracking-wider">
                👤 {displayName}
              </div>
              <NavLink to="/profile" onClick={closeMobileMenu} className={mobileNavLinkClass}>
                My Profile
              </NavLink>
              <NavLink to="/orders" onClick={closeMobileMenu} className={mobileNavLinkClass}>
                My Orders
              </NavLink>
              <NavLink to="/orders" onClick={closeMobileMenu} className={mobileNavLinkClass}>
                Track Orders
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" onClick={closeMobileMenu} className={mobileNavLinkClass}>
              Sign In / Register
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}

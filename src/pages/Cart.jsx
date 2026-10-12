import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import { usePageMeta } from '../utils/seo';

export default function Cart() {
  usePageMeta({ title: 'Shopping Cart', path: '/cart', noindex: true });
  const { cartItems, subtotal, deliveryCharge, totalAmount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:py-28 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-stone-600 mb-6">
          <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Your cart is empty
        </h1>
        <p className="mt-3 text-slate-600 max-w-md mx-auto text-sm sm:text-base">
          Looks like you haven't added anything to your cart yet. Explore products from top brands and find your favorites.
        </p>
        <div className="mt-8">
          <Link
            to="/products"
            id="cart-empty-shop-btn"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
          >
            <span>Shop Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      <div className="border-b border-stone-200/80 pb-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Shopping Cart
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review your items and proceed to fast Cash on Delivery checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs">
          <div className="divide-y divide-stone-100">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary & Proceed to Checkout */}
        <div className="lg:col-span-4 space-y-4">
          <OrderSummary
            subtotal={subtotal}
            deliveryCharge={deliveryCharge}
            totalAmount={totalAmount}
          />

          <Link
            to="/checkout"
            id="proceed-to-checkout-btn"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-4 px-6 text-base font-semibold text-white shadow-md transition hover:bg-slate-800 active:scale-98"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

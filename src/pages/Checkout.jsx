import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import { createOrder } from '../services/orderService';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { usePageMeta } from '../utils/seo';

export default function Checkout() {
  usePageMeta({ title: 'Checkout', path: '/checkout', noindex: true });
  const navigate = useNavigate();
  const { cartItems, subtotal, deliveryCharge, totalAmount, clearCart } = useCart();
  const { customerUser, customerProfile, loading: authLoading } = useCustomerAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'COD'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Redirect unauthenticated customer to /login with return state
  useEffect(() => {
    if (!authLoading && !customerUser) {
      navigate('/login', { state: { from: { pathname: '/checkout' } }, replace: true });
    }
  }, [customerUser, authLoading, navigate]);

  // Pre-fill from customer profile when logged in
  useEffect(() => {
    if (customerProfile || customerUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || customerProfile?.full_name || '',
        phone: prev.phone || customerProfile?.phone || '',
        email: prev.email || customerProfile?.email || customerUser?.email || '',
        address: prev.address || customerProfile?.address || '',
        city: prev.city || customerProfile?.city || '',
        state: prev.state || customerProfile?.state || '',
        pincode: prev.pincode || customerProfile?.pincode || ''
      }));
    }
  }, [customerProfile, customerUser]);


  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        errs.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address';
      }
    }

    if (!formData.address.trim()) {
      errs.address = 'Street address is required';
    }

    if (!formData.city.trim()) {
      errs.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errs.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errs.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (cartItems.length === 0) {
      setSubmitError('Your cart is empty. Please add items to checkout.');
      return;
    }

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const totals = { subtotal, deliveryCharge, totalAmount };
      const orderPayloadData = {
        ...formData,
        userId: customerUser?.id || null
      };

      const result = await createOrder(orderPayloadData, cartItems, totals);

      if (result.success) {
        // Use server-verified totals/items when available so the confirmation
        // always matches what was actually recorded (not cart state).
        const confirmedTotals = result.verifiedTotals || totals;
        const confirmedItems = result.verifiedItems
          ? result.verifiedItems.map((vi) => {
              const original = cartItems.find((c) => String(c.id) === String(vi.id)) || {};
              return { ...original, ...vi };
            })
          : [...cartItems];
        // Order object to pass to confirmation page
        const orderSummaryData = {
          orderId: result.orderId,
          createdAt: result.createdAt,
          customer: {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          },
          items: confirmedItems,
          totals: confirmedTotals,
          paymentMethod: 'Cash on Delivery'
        };

        // Save into sessionStorage as backup for page reload
        sessionStorage.setItem('1tap_last_order', JSON.stringify(orderSummaryData));

        // Clear the cart only after successful order submission
        clearCart();

        // Redirect to Order Confirmation
        navigate('/order-confirmation', {
          state: { order: orderSummaryData },
          replace: true
        });
      } else {
        // Insertion failed: retain cart, show error
        setSubmitError(result.error || 'Failed to place your order. Please check your connection and try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Checkout submit exception:', err);
      setSubmitError('An unexpected error occurred. Please try placing your order again.');
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-600">Please add products to your cart before proceeding to checkout.</p>
        <div className="mt-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Header */}
      <div className="border-b border-stone-200/80 pb-6 mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 mb-2 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Cart</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Complete your delivery details to place your Cash on Delivery order.
        </p>
      </div>

      {/* Submission Error Banner */}
      {submitError && (
        <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Unable to place order</h4>
            <p className="text-xs text-rose-700 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Delivery Details & Payment Choice */}
          <div className="lg:col-span-7">
            <CheckoutForm
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 space-y-4">
            <OrderSummary
              items={cartItems}
              subtotal={subtotal}
              deliveryCharge={deliveryCharge}
              totalAmount={totalAmount}
              showItemList={true}
            />

            <button
              type="submit"
              id="place-order-btn"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-4 px-6 text-base font-semibold text-white shadow-md transition hover:bg-slate-800 active:scale-98 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <span>Place Order • ₹{totalAmount}</span>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              By clicking "Place Order", you agree to pay ₹{totalAmount} in cash upon parcel delivery.
            </p>
          </div>

        </div>
      </form>
    </div>
  );
}

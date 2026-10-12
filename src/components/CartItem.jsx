import React from 'react';
import { Trash2 } from 'lucide-react';
import QuantitySelector from './QuantitySelector';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  const itemSubtotal = Number(item.price) * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 border-b border-slate-200/80 last:border-0">
      
      {/* Product Image & Title */}
      <div className="flex items-center gap-4 flex-1">
        <Link
          to={`/products/${item.id}`}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
        >
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/1tap-pharmacy-logo.png';
            }}
            className="h-full w-full object-cover object-center transition hover:scale-105"
          />
        </Link>
        <div className="space-y-1">
          <Link
            to={`/products/${item.id}`}
            className="font-medium text-slate-900 hover:text-slate-700 transition"
          >
            {item.name}
          </Link>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {item.category || 'Cosmetics'}
          </p>
          <p className="text-sm font-semibold text-slate-700 sm:hidden">
            ₹{item.price} each
          </p>
        </div>
      </div>

      {/* Price Per Unit (Desktop) */}
      <div className="hidden sm:block text-right w-24">
        <span className="text-sm text-slate-500 block">Unit Price</span>
        <span className="font-medium text-slate-800">₹{item.price}</span>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center gap-3">
        <QuantitySelector
          quantity={item.quantity}
          onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
          onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
        />
        <button
          type="button"
          onClick={() => removeFromCart(item.id)}
          aria-label={`Remove ${item.name} from cart`}
          className="p-2 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right sm:w-28 flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <span className="text-xs text-slate-500 sm:block">Item Subtotal</span>
        <span className="text-base font-bold text-slate-950">
          ₹{itemSubtotal}
        </span>
      </div>
    </div>
  );
}

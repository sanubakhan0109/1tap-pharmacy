import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';
import { useCustomerAuth } from './CustomerAuthContext';

const CartContext = createContext(null);

const getCartStorageKey = (userId) => {
  return userId ? `1tap_cart_${userId}` : '1tap_guest_cart';
};

const loadCartFromStorage = (userId) => {
  try {
    const key = getCartStorageKey(userId);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('Error loading cart from storage:', err);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { showToast } = useToast();
  const { customerUser } = useCustomerAuth();
  const currentUserId = customerUser?.id || null;

  const [cartItems, setCartItems] = useState(() => loadCartFromStorage(currentUserId));
  const isInitialMount = useRef(true);
  const prevUserIdRef = useRef(currentUserId);

  // Switch cart when authenticated user changes (login / logout / switch account)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevUserIdRef.current = currentUserId;
      return;
    }

    if (prevUserIdRef.current !== currentUserId) {
      prevUserIdRef.current = currentUserId;
      const userCart = loadCartFromStorage(currentUserId);
      setCartItems(userCart);
    }
  }, [currentUserId]);

  // Save to current user's storage key whenever cartItems changes
  useEffect(() => {
    try {
      const key = getCartStorageKey(currentUserId);
      localStorage.setItem(key, JSON.stringify(cartItems));
    } catch (err) {
      console.error('Error saving cart to storage:', err);
    }
  }, [cartItems, currentUserId]);

  const addToCart = (product, quantity = 1, silent = false) => {
    if (!product || quantity < 1) return;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image,
            quantity: quantity,
            shortDescription: product.shortDescription
          }
        ];
      }
    });

    if (!silent) {
      showToast(`Added to cart: ${product.name} (x${quantity})`);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === productId);
      if (itemToRemove) {
        showToast(`Removed from cart: ${itemToRemove.name}`);
      }
      return prevItems.filter((item) => item.id !== productId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      const key = getCartStorageKey(currentUserId);
      localStorage.removeItem(key);
    } catch (err) {
      console.error('Error clearing cart storage:', err);
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const deliveryCharge = 0; // Free delivery
  const totalAmount = subtotal + deliveryCharge;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        deliveryCharge,
        totalAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};


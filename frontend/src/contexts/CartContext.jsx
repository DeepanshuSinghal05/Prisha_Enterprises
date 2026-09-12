import { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Product details kept in local cart state are display-only. The checkout API
// always reloads products and calculates the final amount from database prices.

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'prisha_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    const productId = typeof product === 'object' ? product.id : product;
    const displayDetails = typeof product === 'object'
      ? {
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url || product.image || null
        }
      : {};

    setItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, ...displayDetails, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity, ...displayDetails }];
    });
  };

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const cartItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      id: item.productId
    }));
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Display estimate only; the backend supplies the authoritative total at checkout.
  const cartTotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
      0
    );
  }, [items]);

  const value = {
    items,
    cartItems,
    totalItems,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

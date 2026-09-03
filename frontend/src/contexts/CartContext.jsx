import { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Helper to get product price (using static products for price calculation)
const products = [
  { id: 1, price: 7500 }, { id: 2, price: 10500 }, { id: 3, price: 12500 },
  { id: 4, price: 15500 }, { id: 5, price: 17500 }, { id: 6, price: 21500 },
  { id: 7, price: 24500 }, { id: 8, price: 28500 }, { id: 9, price: 35500 },
  { id: 10, price: 42500 }
];

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

  const addToCart = (productId, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
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

  // Calculate cart total
  const cartTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
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

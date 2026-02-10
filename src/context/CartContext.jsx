import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      // 1. Ambil data dengan proteksi try-catch untuk menghindari crash jika JSON korup
      const savedCart = localStorage.getItem('siplog-cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Gagal memuat keranjang dari storage:", error);
      return [];
    }
  });

  useEffect(() => {
    // 2. Simpan ke localStorage setiap ada perubahan pada state cart
    localStorage.setItem('siplog-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateCartQty = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(c => {
        if (c.id === id) {
          const newQty = c.quantity + delta;
          return newQty > 0 ? { ...c, quantity: newQty } : null;
        }
        return c;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const getCartItem = (id) => {
    return cart.find(c => c.id === id);
  };

  const clearCart = () => {
    // 3. REVISI: Hapus juga dari localStorage secara eksplisit saat keranjang dikosongkan
    setCart([]);
    localStorage.removeItem('siplog-cart');
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateCartQty, 
      removeFromCart, 
      getCartItem,
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};
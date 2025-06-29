import React, { createContext, useContext } from 'react';
import { useCart as useCartHook } from '@/hooks/useCart';

const CartContext = createContext<ReturnType<typeof useCartHook> | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const cart = useCartHook();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 
"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";
import { JsonValue } from "@prisma/client/runtime/library";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrls?: JsonValue;
}

interface CartProduct {
  id: string;
  name: string;
  price: number;
  imageUrls?: JsonValue;
  quantity?: number;
}

interface CartContextType {
  cart: CartProduct[];
  refreshCart: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    if (session?.user) {
      const res = await fetch("/api/cart?allPending=1");
      const data = await res.json();
      const allItems = (Array.isArray(data) ? data : [data])
        .flatMap((order: { items: CartProduct[] }) => order.items || []);
      setCart(allItems);
    } else {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(stored);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchCart();
    const handler = () => fetchCart();
    window.addEventListener("storage", handler);
    window.addEventListener("cart-updated", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("cart-updated", handler);
    };
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cart, refreshCart: fetchCart, loading }}>
      {children}
    </CartContext.Provider>
  );
} 
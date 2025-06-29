import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { JsonValue } from '@prisma/client/runtime/library';

interface CartProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrls?: JsonValue;
}

interface CartState {
  items: CartProduct[];
  loading: boolean;
  error: string | null;
}

interface UseCartReturn extends CartState {
  addToCart: (product: { id: string; name: string; price: number; imageUrls?: JsonValue }) => Promise<void>;
  addMultipleToCart: (products: { id: string; name: string; price: number; imageUrls?: JsonValue }[]) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  removeMultipleFromCart: (productIds: string[]) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getCartTotal: () => number;
  getCartCount: () => number;
  batchLoading: boolean;
}

export function useCart(): UseCartReturn {
  const [state, setState] = useState<CartState>({
    items: [],
    loading: true,
    error: null,
  });
  const [batchLoading, setBatchLoading] = useState(false);

  // Fetch cart from localStorage
  const fetchCart = useCallback(async () => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setState({
      items: stored,
      loading: false,
      error: null,
    });
  }, []);

  // Initialize cart
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };
    window.addEventListener('storage', handleCartUpdate);
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => {
      window.removeEventListener('storage', handleCartUpdate);
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [fetchCart]);

  // --- Add to Cart ---
  const addToCart = useCallback(async (product: { id: string; name: string; price: number; imageUrls?: JsonValue }) => {
    setState(prev => {
      if (prev.items.some(item => item.id === product.id)) return prev;
      return {
        ...prev,
        items: [...prev.items, { ...product, quantity: 1 }],
      };
    });
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: { id: string }) => item.id === product.id);
    if (!existingItem) {
      cart.push({ ...product, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      setState(prev => ({ ...prev, items: cart }));
      toast.success('Added to cart!');
      window.dispatchEvent(new Event('storage'));
    } else {
      toast.info('Already in cart');
    }
  }, []);

  // --- Remove from Cart ---
  const removeFromCart = useCallback(async (productId: string) => {
    setState(prev => {
      return { ...prev, items: prev.items.filter(item => item.id !== productId) };
    });
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updated = cart.filter((item: { id: string }) => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updated));
    setState(prev => ({ ...prev, items: updated }));
    toast.success('Removed from cart!');
    window.dispatchEvent(new Event('storage'));
  }, []);

  // --- Batch Add ---
  const addMultipleToCart = useCallback(async (products: { id: string; name: string; price: number; imageUrls?: JsonValue }[]) => {
    if (products.length === 0) return;
    setBatchLoading(true);
    setState(prev => {
      const newItems = products.filter(p => !prev.items.some(item => item.id === p.id)).map(p => ({ ...p, quantity: 1 }));
      return { ...prev, items: [...prev.items, ...newItems] };
    });
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let addedCount = 0;
    products.forEach(product => {
      const existingItem = cart.find((item: { id: string }) => item.id === product.id);
      if (!existingItem) {
        cart.push({ ...product, quantity: 1 });
        addedCount++;
      }
    });
    if (addedCount > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
      setState(prev => ({ ...prev, items: cart }));
      toast.success(`Added ${addedCount} item${addedCount > 1 ? 's' : ''} to cart!`);
      window.dispatchEvent(new Event('storage'));
    }
    setBatchLoading(false);
  }, []);

  // --- Batch Remove ---
  const removeMultipleFromCart = useCallback(async (productIds: string[]) => {
    if (productIds.length === 0) return;
    setBatchLoading(true);
    setState(prev => {
      return { ...prev, items: prev.items.filter(item => !productIds.includes(item.id)) };
    });
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updated = cart.filter((item: { id: string }) => !productIds.includes(item.id));
    localStorage.setItem('cart', JSON.stringify(updated));
    setState(prev => ({ ...prev, items: updated }));
    toast.success(`Removed ${productIds.length} item${productIds.length > 1 ? 's' : ''} from cart!`);
    window.dispatchEvent(new Event('storage'));
    setBatchLoading(false);
  }, []);

  // --- Update Quantity ---
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updated = cart.map((item: { id: string; quantity: number }) =>
      item.id === productId ? { ...item, quantity } : item
    );
    localStorage.setItem('cart', JSON.stringify(updated));
    setState(prev => ({ ...prev, items: updated }));
    window.dispatchEvent(new Event('storage'));
  }, [removeFromCart]);

  // --- Clear Cart ---
  const clearCart = useCallback(async () => {
    localStorage.removeItem('cart');
    setState(prev => ({ ...prev, items: [] }));
    window.dispatchEvent(new Event('storage'));
    toast.success('Cart cleared!');
  }, []);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  const isInCart = useCallback((productId: string) => {
    return state.items.some(item => item.id === productId);
  }, [state.items]);

  const getCartTotal = useCallback(() => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [state.items]);

  const getCartCount = useCallback(() => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  }, [state.items]);

  return {
    ...state,
    addToCart,
    addMultipleToCart,
    removeFromCart,
    removeMultipleFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    isInCart,
    getCartTotal,
    getCartCount,
    batchLoading,
  };
} 
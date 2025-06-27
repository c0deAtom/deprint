import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { JsonValue } from '@prisma/client/runtime/library';

interface CartProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrls?: JsonValue;
}

interface CartItem {
  productId: string;
  product?: {
    name?: string;
    imageUrls?: JsonValue;
  };
  price: number;
  quantity?: number;
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

// Cache for cart data to reduce API calls
let cartCache: CartProduct[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

const isCacheValid = () => {
  return Date.now() - cacheTimestamp < CACHE_DURATION;
};

export function useCart(): UseCartReturn {
  const { data: session } = useSession();
  const [state, setState] = useState<CartState>({
    items: [],
    loading: true,
    error: null,
  });
  const [batchLoading, setBatchLoading] = useState(false);

  // Memoized cart operations
  const fetchCart = useCallback(async () => {
    if (!session?.user) {
      // For guest users, use localStorage
      const stored = JSON.parse(localStorage.getItem('cart') || '[]');
      setState({
        items: stored,
        loading: false,
        error: null,
      });
      return;
    }

    // Check cache first
    if (isCacheValid() && cartCache.length > 0) {
      setState({
        items: cartCache,
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const res = await fetch('/api/cart?allPending=1');
      if (!res.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await res.json();
      const allItems = (Array.isArray(data) ? data : [data])
        .flatMap((order: { items: CartItem[] }) => order.items || [])
        .map((item: CartItem) => ({
          id: item.productId,
          name: item.product?.name || 'Unknown Product',
          price: item.price,
          quantity: item.quantity || 1,
          imageUrls: item.product?.imageUrls,
        }));

      // Update cache
      cartCache = allItems;
      cacheTimestamp = Date.now();

      setState({
        items: allItems,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      setState({
        items: [],
        loading: false,
        error: 'Failed to load cart',
      });
    }
  }, [session?.user]);

  // Initialize cart
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      // Invalidate cache and refresh
      cacheTimestamp = 0;
      fetchCart();
    };

    window.addEventListener('storage', handleCartUpdate);
    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleCartUpdate);
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [fetchCart]);

  // --- Optimistic Add to Cart ---
  const addToCart = useCallback(async (product: { id: string; name: string; price: number; imageUrls?: JsonValue }) => {
    // Optimistically update state
    setState(prev => {
      if (prev.items.some(item => item.id === product.id)) return prev;
      return {
        ...prev,
        items: [...prev.items, { ...product, quantity: 1 }],
      };
    });
    try {
      if (session?.user) {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to add to cart');
        cacheTimestamp = 0;
        await fetchCart();
        toast.success('Added to cart!');
      } else {
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
      }
    } catch {
      // Revert optimistic update
      setState(prev => ({ ...prev, items: prev.items.filter(item => item.id !== product.id) }));
      toast.error('Failed to add to cart');
    }
  }, [session?.user, fetchCart]);

  // --- Optimistic Remove from Cart ---
  const removeFromCart = useCallback(async (productId: string) => {
    // Optimistically update state
    let prevItem: CartProduct | undefined;
    setState(prev => {
      prevItem = prev.items.find(item => item.id === productId);
      return { ...prev, items: prev.items.filter(item => item.id !== productId) };
    });
    try {
      if (session?.user) {
        const res = await fetch(`/api/cart?productId=${productId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to remove from cart');
        cacheTimestamp = 0;
        await fetchCart();
        toast.success('Removed from cart!');
      } else {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updated = cart.filter((item: { id: string }) => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(updated));
        setState(prev => ({ ...prev, items: updated }));
        toast.success('Removed from cart!');
        window.dispatchEvent(new Event('storage'));
      }
    } catch {
      // Revert optimistic update
      setState(prev => prevItem ? { ...prev, items: [...prev.items, prevItem!] } : prev);
      toast.error('Failed to remove from cart');
    }
  }, [session?.user, fetchCart]);

  // --- Optimistic Batch Add ---
  const addMultipleToCart = useCallback(async (products: { id: string; name: string; price: number; imageUrls?: JsonValue }[]) => {
    if (products.length === 0) return;
    setBatchLoading(true);
    // Optimistically update state
    setState(prev => {
      const newItems = products.filter(p => !prev.items.some(item => item.id === p.id)).map(p => ({ ...p, quantity: 1 }));
      return { ...prev, items: [...prev.items, ...newItems] };
    });
    try {
      if (session?.user) {
        const res = await fetch('/api/cart/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds: products.map(p => p.id) }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to add items to cart');
        cacheTimestamp = 0;
        await fetchCart();
        const result = await res.json();
        if (result.added > 0) toast.success(`Added ${result.added} item${result.added > 1 ? 's' : ''} to cart!`);
        if (result.incremented > 0) toast.info(`Updated ${result.incremented} existing item${result.incremented > 1 ? 's' : ''} in cart`);
        if (result.skipped > 0) toast.warning(`${result.skipped} item${result.skipped > 1 ? 's' : ''} could not be added`);
      } else {
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
      }
    } catch {
      // Revert optimistic update
      setState(prev => ({ ...prev, items: prev.items.filter(item => !products.some(p => p.id === item.id)) }));
      toast.error('Failed to add items to cart');
    } finally {
      setBatchLoading(false);
    }
  }, [session?.user, fetchCart]);

  // --- Optimistic Batch Remove ---
  const removeMultipleFromCart = useCallback(async (productIds: string[]) => {
    if (productIds.length === 0) return;
    setBatchLoading(true);
    // Optimistically update state
    let prevItems: CartProduct[] = [];
    setState(prev => {
      prevItems = prev.items.filter(item => productIds.includes(item.id));
      return { ...prev, items: prev.items.filter(item => !productIds.includes(item.id)) };
    });
    try {
      if (session?.user) {
        const res = await fetch(`/api/cart/batch?productIds=${productIds.join(',')}`, { method: 'DELETE' });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to remove items from cart');
        cacheTimestamp = 0;
        await fetchCart();
        const result = await res.json();
        if (result.deleted > 0) toast.success(`Removed ${result.deleted} item${result.deleted > 1 ? 's' : ''} from cart!`);
      } else {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updated = cart.filter((item: { id: string }) => !productIds.includes(item.id));
        localStorage.setItem('cart', JSON.stringify(updated));
        setState(prev => ({ ...prev, items: updated }));
        toast.success(`Removed ${productIds.length} item${productIds.length > 1 ? 's' : ''} from cart!`);
        window.dispatchEvent(new Event('storage'));
      }
    } catch {
      // Revert optimistic update
      setState(prev => ({ ...prev, items: [...prev.items, ...prevItems] }));
      toast.error('Failed to remove items from cart');
    } finally {
      setBatchLoading(false);
    }
  }, [session?.user, fetchCart]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    try {
      if (session?.user) {
        // For now, we'll remove and re-add with new quantity
        // In a real app, you'd have a PATCH endpoint for this
        await removeFromCart(productId);
        for (let i = 0; i < quantity; i++) {
          await addToCart({ id: productId, name: '', price: 0 });
        }
      } else {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updated = cart.map((item: { id: string; quantity: number }) =>
          item.id === productId ? { ...item, quantity } : item
        );
        localStorage.setItem('cart', JSON.stringify(updated));
        setState(prev => ({ ...prev, items: updated }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch {
      toast.error('Failed to update quantity');
    }
  }, [session?.user, removeFromCart, addToCart]);

  const clearCart = useCallback(async () => {
    try {
      if (session?.user) {
        // Remove all items in parallel
        const itemsToRemove = [...state.items];
        await removeMultipleFromCart(itemsToRemove.map(item => item.id));
      } else {
        localStorage.removeItem('cart');
        setState(prev => ({ ...prev, items: [] }));
        window.dispatchEvent(new Event('storage'));
      }
      toast.success('Cart cleared!');
    } catch {
      toast.error('Failed to clear cart');
    }
  }, [session?.user, state.items, removeMultipleFromCart]);

  const refreshCart = useCallback(async () => {
    cacheTimestamp = 0; // Invalidate cache
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
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { JsonValue } from '@prisma/client/runtime/library';

interface CartProduct {
  id: string; // cartItemId for server, productId for local
  productId?: string; // productId for server
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
  getCartSubtotal: () => number;
  getCartCount: () => number;
  batchLoading: boolean;
}

export function useCart(): UseCartReturn {
  const { data: session, status } = useSession();
  const isLoggedIn = !!(session?.user && (session.user as { id?: string }).id);
  const [state, setState] = useState<CartState>({
    items: [],
    loading: false,
    error: null,
  });
  const [batchLoading, setBatchLoading] = useState(false);
  
  // Refs for optimization
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Array<() => Promise<void>>>([]);
  const lastSyncRef = useRef<number>(0);
  const isInitializedRef = useRef(false);

  // --- Optimistic Cart Operations ---
  const optimisticUpdate = useCallback((updater: (items: CartProduct[]) => CartProduct[]) => {
    setState(prev => ({
      ...prev,
      items: updater(prev.items)
    }));
  }, []);

  const loadCart = useCallback(async () => {
    if (isInitializedRef.current) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      if (isLoggedIn) {
        // 1. Fetch server cart
        const res = await fetch('/api/cart');
        let serverItems: CartProduct[] = [];
        if (res.ok) {
          const data = await res.json();
          serverItems = data.items;
        }
        // 2. Get local cart
        const localCart: CartProduct[] = JSON.parse(localStorage.getItem('cart') || '[]');
        // 3. Find items in local cart NOT in server cart
        const missing = localCart.filter(localItem =>
          !serverItems.some(serverItem =>
            (serverItem.productId || serverItem.id) === (localItem.id || localItem.productId)
          )
        );
        // 4. If there are missing items, batch add them
        if (missing.length > 0) {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(missing.map(item => ({ productId: item.id || item.productId, quantity: item.quantity })))
          });
        }
        // 5. Clear local cart
        localStorage.removeItem('cart');
        // 6. Fetch server cart again for up-to-date state
        const res2 = await fetch('/api/cart');
        if (res2.ok) {
          const data2 = await res2.json();
          setState({ items: data2.items, loading: false, error: null });
          // Cache the data
          localStorage.setItem('cartCache', JSON.stringify(data2.items));
          localStorage.setItem('cartCacheTime', Date.now().toString());
        } else {
          setState(prev => ({ ...prev, loading: false, error: 'Failed to fetch cart' }));
        }
      } else {
        // Load from localStorage
        const stored = JSON.parse(localStorage.getItem('cart') || '[]');
        setState({ items: stored, loading: false, error: null });
      }
    } catch {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load cart' }));
    }

    isInitializedRef.current = true;
  }, [isLoggedIn]);

  const refreshCart = useCallback(async () => {
    isInitializedRef.current = false;
    await loadCart();
  }, [loadCart]);

  const debouncedSync = useCallback(async () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      if (pendingChangesRef.current.length === 0) return;
      
      const changes = [...pendingChangesRef.current];
      pendingChangesRef.current = [];
      
      try {
        // Execute all pending changes
        await Promise.all(changes.map(change => change()));
        lastSyncRef.current = Date.now();
      } catch (error) {
        console.error('Cart sync failed:', error);
        // Revert optimistic updates on error
        await refreshCart();
      }
    }, 500); // 500ms debounce
  }, [refreshCart]);

  const queueChange = useCallback((change: () => Promise<void>) => {
    pendingChangesRef.current.push(change);
    debouncedSync();
  }, [debouncedSync]);

  // --- Fast Add to Cart (Optimistic) ---
  const addToCart = useCallback(async (product: { id: string; name: string; price: number; imageUrls?: JsonValue }) => {
    // Optimistic update
    optimisticUpdate(items => {
      const existingItem = items.find(item => item.id === product.id || item.productId === product.id);
      if (existingItem) {
        toast.info('Already in cart');
        return items;
      }
      toast.success('Added to cart!');
      return [...items, { ...product, quantity: 1 }];
    });

    if (isLoggedIn) {
      // Queue server sync
      queueChange(async () => {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity: 1 })
        });
      });
    } else {
      // Update localStorage immediately
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: { id: string }) => item.id === product.id);
      if (!existingItem) {
        cart.push({ ...product, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    }
  }, [isLoggedIn, optimisticUpdate, queueChange]);

  // --- Fast Remove from Cart (Optimistic) ---
  const removeFromCart = useCallback(async (productId: string) => {
    // Optimistic update
    optimisticUpdate(items => {
      toast.success('Removed from cart!');
      return items.filter(item => item.id !== productId && item.productId !== productId);
    });

    if (isLoggedIn) {
      // Queue server sync
      queueChange(async () => {
        const item = state.items.find(i => i.id === productId || i.productId === productId);
        if (item) {
          await fetch(`/api/cart?cartItemId=${item.id}`, { method: 'DELETE' });
        }
      });
    } else {
      // Update localStorage immediately
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updated = cart.filter((item: { id: string }) => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(updated));
    }
  }, [isLoggedIn, optimisticUpdate, queueChange, state.items]);

  // --- Fast Update Quantity (Optimistic) ---
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    // Optimistic update
    optimisticUpdate(items => {
      return items.map(item => 
        (item.id === productId || item.productId === productId) 
          ? { ...item, quantity } 
          : item
      );
    });

    if (isLoggedIn) {
      // Queue server sync
      queueChange(async () => {
        const item = state.items.find(i => i.id === productId || i.productId === productId);
        if (item) {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cartItemId: item.id, quantity })
          });
        }
      });
    } else {
      // Update localStorage immediately
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updated = cart.map((item: { id: string; quantity: number }) =>
        item.id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(updated));
    }
  }, [isLoggedIn, optimisticUpdate, queueChange, state.items, removeFromCart]);

  // --- Fast Batch Add (Optimistic) ---
  const addMultipleToCart = useCallback(async (products: { id: string; name: string; price: number; imageUrls?: JsonValue }[]) => {
    if (products.length === 0) return;
    setBatchLoading(true);

    // Optimistic update
    optimisticUpdate(items => {
      const newItems = products.filter(p => !items.some(item => item.id === p.id || item.productId === p.id))
        .map(p => ({ ...p, quantity: 1 }));
      toast.success(`Added ${newItems.length} item${newItems.length > 1 ? 's' : ''} to cart!`);
      return [...items, ...newItems];
    });

    if (isLoggedIn) {
      // Queue server sync
      queueChange(async () => {
        for (const product of products) {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id, quantity: 1 })
          });
        }
      });
    } else {
      // Update localStorage immediately
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      products.forEach(product => {
        const existingItem = cart.find((item: { id: string }) => item.id === product.id);
        if (!existingItem) {
          cart.push({ ...product, quantity: 1 });
        }
      });
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    setBatchLoading(false);
  }, [isLoggedIn, optimisticUpdate, queueChange]);

  // --- Fast Batch Remove (Optimistic) ---
  const removeMultipleFromCart = useCallback(async (productIds: string[]) => {
    if (productIds.length === 0) return;
    setBatchLoading(true);

    // Optimistic update
    optimisticUpdate(items => {
      toast.success(`Removed ${productIds.length} item${productIds.length > 1 ? 's' : ''} from cart!`);
      return items.filter(item => !productIds.includes(item.id) && !productIds.includes(item.productId || ''));
    });

    if (isLoggedIn) {
      // Queue server sync
      queueChange(async () => {
        for (const productId of productIds) {
          const item = state.items.find(i => i.id === productId || i.productId === productId);
          if (item) {
            await fetch(`/api/cart?cartItemId=${item.id}`, { method: 'DELETE' });
          }
        }
      });
    } else {
      // Update localStorage immediately
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updated = cart.filter((item: { id: string }) => !productIds.includes(item.id));
      localStorage.setItem('cart', JSON.stringify(updated));
    }
    setBatchLoading(false);
  }, [isLoggedIn, optimisticUpdate, queueChange, state.items]);

  // --- Fast Clear Cart (Optimistic) ---
  const clearCart = useCallback(async () => {
    // Optimistic update
    optimisticUpdate(() => {
      toast.success('Cart cleared!');
      return [];
    });

    if (isLoggedIn) {
      // Queue server sync
      queueChange(async () => {
        for (const item of state.items) {
          await fetch(`/api/cart?cartItemId=${item.id}`, { method: 'DELETE' });
        }
      });
    } else {
      localStorage.removeItem('cart');
    }
  }, [isLoggedIn, optimisticUpdate, queueChange, state.items]);

  // --- Initialize cart once ---
  useEffect(() => {
    if (status !== 'loading' && !isInitializedRef.current) {
      loadCart();
    }
  }, [status, loadCart]);

  // --- Reset on auth change ---
  useEffect(() => {
    if (status !== 'loading') {
      isInitializedRef.current = false;
      loadCart();
    }
  }, [status, loadCart]);

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const isInCart = useCallback((productId: string) => {
    return state.items.some(item => item.id === productId || item.productId === productId);
  }, [state.items]);

  const getCartTotal = useCallback(() => {
    const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 80; // Shipping rate ₹80
    return subtotal + shipping;
  }, [state.items]);

  const getCartSubtotal = useCallback(() => {
    const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    return subtotal;
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
    getCartSubtotal,
    getCartCount,
    batchLoading,
  };
}
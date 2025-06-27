import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { JsonValue } from '@prisma/client/runtime/library';

interface CartProduct {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrls?: JsonValue;
  };
}

interface CartStatus {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalItems: number;
  totalPrice: number;
  productIds: string[];
  isAuthenticated: boolean;
  isProductInCart?: boolean;
  productQuantity?: number;
}

interface CartDetails {
  items: CartProduct[];
  totalItems: number;
  totalPrice: number;
  orderCount: number;
}

interface UseCartBackendReturn {
  // Cart data
  cartItems: CartProduct[];
  cartStatus: CartStatus | null;
  loading: boolean;
  error: string | null;
  
  // Operation loading states
  addingToCart: Set<string>;
  removingFromCart: Set<string>;
  
  // Cart operations
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  checkCartStatus: (productId?: string) => Promise<void>;
  refreshCartDetails: () => Promise<void>;
  
  // Utility functions
  isInCart: (productId: string) => boolean;
  getCartCount: () => number;
  getCartTotal: () => number;
  getProductQuantity: (productId: string) => number;
  isProductLoading: (productId: string) => boolean;
}

export function useCartBackend(): UseCartBackendReturn {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [cartStatus, setCartStatus] = useState<CartStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const [removingFromCart, setRemovingFromCart] = useState<Set<string>>(new Set());

  // Fetch cart status (lightweight)
  const checkCartStatus = useCallback(async (productId?: string) => {
    if (!session?.user) {
      setCartStatus({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        productIds: [],
        isAuthenticated: false
      });
      setLoading(false);
      return;
    }

    try {
      const url = productId 
        ? `/api/cart/status?productId=${productId}`
        : '/api/cart/status';
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch cart status');
      
      const status = await res.json();
      setCartStatus(status);
    } catch (error) {
      console.error('Error checking cart status:', error);
      setError('Failed to load cart status');
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  // Fetch complete cart details (for cart page)
  const refreshCartDetails = useCallback(async () => {
    if (!session?.user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/cart/details');
      if (!res.ok) throw new Error('Failed to fetch cart details');
      
      const details: CartDetails = await res.json();
      setCartItems(details.items);
      setError(null);
    } catch (error) {
      console.error('Error fetching cart details:', error);
      setError('Failed to load cart details');
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  // Optimistic update cart items
  const updateCartItemsOptimistically = useCallback((productId: string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    }
    // For add, we don't update cartItems since we don't have product details
    // The cart status will be updated which is sufficient for most cases
  }, []);

  // Quick add to cart
  const addToCart = useCallback(async (productId: string) => {
    if (!session?.user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    // Set loading state for this specific product
    setAddingToCart(prev => new Set(prev).add(productId));

    try {
      const res = await fetch('/api/cart/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add to cart');
      }

      const result = await res.json();
      
      // Update cart status immediately (lightweight)
      await checkCartStatus();
      
      if (result.added) {
        toast.success('Added to cart!');
      } else if (result.incremented) {
        toast.info('Quantity updated in cart');
      }
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      // Clear loading state for this specific product
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [session?.user, checkCartStatus]);

  // Quick remove from cart
  const removeFromCart = useCallback(async (productId: string) => {
    if (!session?.user) {
      toast.error('Please sign in to manage cart');
      return;
    }

    // Set loading state for this specific product
    setRemovingFromCart(prev => new Set(prev).add(productId));

    // Optimistic update - remove from cart items immediately
    updateCartItemsOptimistically(productId, 'remove');

    try {
      const res = await fetch(`/api/cart/quick-remove?productId=${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove from cart');
      }

      await res.json();
      
      // Update cart status immediately (lightweight)
      await checkCartStatus();
      
      toast.success('Removed from cart!');
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove from cart');
      
      // Revert optimistic update on error
      await refreshCartDetails();
    } finally {
      // Clear loading state for this specific product
      setRemovingFromCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [session?.user, checkCartStatus, updateCartItemsOptimistically, refreshCartDetails]);

  // Initialize cart status
  useEffect(() => {
    checkCartStatus();
  }, [checkCartStatus]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      checkCartStatus();
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [checkCartStatus]);

  // Utility functions
  const isInCart = useCallback((productId: string) => {
    return cartStatus?.productIds.includes(productId) || false;
  }, [cartStatus]);

  const getCartCount = useCallback(() => {
    return cartStatus?.totalItems || 0;
  }, [cartStatus]);

  const getCartTotal = useCallback(() => {
    return cartStatus?.totalPrice || 0;
  }, [cartStatus]);

  const getProductQuantity = useCallback((productId: string) => {
    if (!cartStatus?.items) return 0;
    const item = cartStatus.items.find((item: { productId: string; quantity: number }) => item.productId === productId);
    return item?.quantity || 0;
  }, [cartStatus]);

  const isProductLoading = useCallback((productId: string) => {
    return addingToCart.has(productId) || removingFromCart.has(productId);
  }, [addingToCart, removingFromCart]);

  return {
    cartItems,
    cartStatus,
    loading,
    error,
    addingToCart,
    removingFromCart,
    addToCart,
    removeFromCart,
    checkCartStatus,
    refreshCartDetails,
    isInCart,
    getCartCount,
    getCartTotal,
    getProductQuantity,
    isProductLoading,
  };
} 
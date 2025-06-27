"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ShoppingCart, Check, Loader2, Trash2 } from "lucide-react";
import { useCartBackend } from "@/hooks/useCartBackend";

interface CartItemBackendProps {
  productId: string;
  className?: string;
}

export default function CartItemBackend({ productId, className }: CartItemBackendProps) {
  const { 
    isInCart, 
    addToCart, 
    removeFromCart, 
    loading,
    isProductLoading,
    addingToCart,
    removingFromCart
  } = useCartBackend();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (isProductLoading(productId) || added) return;
    
    try {
      await addToCart(productId);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleRemoveFromCart = async () => {
    if (isProductLoading(productId)) return;
    
    try {
      await removeFromCart(productId);
    } catch {
      // Error handling is done in the hook
    }
  };

  const isLoading = loading || isProductLoading(productId);
  const inCart = isInCart(productId);

  if (inCart) {
    return (
      <Button 
        size="lg" 
        variant="destructive" 
        className={`w-full transition-all duration-200 hover:scale-105 ${className || ''}`}
        onClick={handleRemoveFromCart} 
        disabled={isLoading}
      >
        {removingFromCart.has(productId) ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Removing...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </>
        )}
      </Button>
    );
  }

  return (
    <Button 
      size="lg" 
      className={`w-full transition-all duration-200 ${
        added 
          ? 'bg-green-600 hover:bg-green-700 scale-105' 
          : 'hover:scale-105'
      } ${className || ''}`}
      onClick={handleAddToCart} 
      disabled={isLoading || added}
    >
      {added ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Added!
        </>
      ) : addingToCart.has(productId) ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
} 
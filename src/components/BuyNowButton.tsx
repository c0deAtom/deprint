"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { JsonValue } from "@prisma/client/runtime/library";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrls?: JsonValue;
  category?: string | null;
}

export default function BuyNowButton({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { addToCart, isInCart } = useCart();

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      // Check if product is already in cart
      if (isInCart(product.id)) {
        // If already in cart, just redirect to checkout
        toast.success("Product already in cart! Redirecting to checkout...");
        setIsNavigating(true);
        setTimeout(() => {
          router.push("/checkout");
        }, 1000);
        return;
      }

      // Add the product to cart (without clearing existing items)
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrls: product.imageUrls,
      });

      toast.success("Product added to cart! Redirecting to checkout...");
      setIsNavigating(true);
      
      // Small delay to show the success message before redirecting
      setTimeout(() => {
        router.push("/checkout");
      }, 1000);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      toast.error("Failed to add product to cart");
      setLoading(false);
    }
  };

  // Reset loading state when component unmounts or navigation completes
  useEffect(() => {
    return () => {
      setLoading(false);
      setIsNavigating(false);
    };
  }, []);

  const isLoading = loading || isNavigating;

  return (
    <Button 
      variant="default" 
      size="lg"
      className="w-full transition-all duration-200 hover:scale-105"
      onClick={handleBuyNow}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {isNavigating ? "Buying..." : "Processing..."}
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />     
          Buy Now
        </>
      )}
    </Button>
  );
} 
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { JsonValue } from "@prisma/client/runtime/library";
import { useCart } from "@/hooks/useCart";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrls?: JsonValue;
  category?: string | null;
}

export default function BuyNowButton({ product }: { product: Product }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToCart, clearCart } = useCart();

  const handleBuyNow = async () => {
    if (!session?.user) {
      toast.error("Please sign in to purchase");
      return;
    }

    setLoading(true);
    try {
      // Clear the cart first to ensure only this product is in it
      await clearCart();
      
      // Add the product to cart
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrls: product.imageUrls,
      });

      toast.success("Product added to cart! Redirecting to checkout...");
      
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

  return (
    <Button 
      variant="default" 
      size="lg"
      className="w-full transition-all duration-200 hover:scale-105"
      onClick={handleBuyNow}
      disabled={loading || !session?.user}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Adding to Cart...
        </>
      ) : session?.user ? (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Buy Now
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Sign in to Buy
        </>
      )}
    </Button>
  );
} 
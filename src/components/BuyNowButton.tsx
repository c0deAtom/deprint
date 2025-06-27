"use client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { JsonValue } from "@prisma/client/runtime/library";
import { Loader2, CreditCard } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrls?: JsonValue;
}

export default function BuyNowButton({ product }: { product: Product }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    if (!session?.user) {
      toast.error("Please sign in to purchase");
      return;
    }

    setLoading(true);
    try {
      // Create a direct order
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: product.id, quantity: 1, price: product.price }],
        }),
      });

      if (res.ok) {
        const order = await res.json();
        toast.success(`Order placed successfully! Order #${order.id.slice(-8)}`);
      } else {
        toast.error("Purchase failed");
      }
    } catch {
      console.error("Failed to create order");
      toast.error("Purchase failed");
    }
    setLoading(false);
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
          Processing...
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
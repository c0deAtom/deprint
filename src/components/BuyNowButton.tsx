"use client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { JsonValue } from "@prisma/client/runtime/library";

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
    }
    setLoading(false);
  };

  return (
    <Button 
      variant="default" 
      size="lg"
      className="w-full"
      onClick={handleBuyNow}
      disabled={loading || !session?.user}
    >
      {loading ? "Processing..." : session?.user ? "Buy Now" : "Sign in to Buy"}
    </Button>
  );
} 
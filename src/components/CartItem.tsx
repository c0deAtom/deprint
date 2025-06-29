"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { JsonValue } from "@prisma/client/runtime/library";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrls?: JsonValue;
}

export default function CartItem({ product }: { product: Product }) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [inCart, setInCart] = useState(false);

  // Check if product is in cart
  useEffect(() => {
    setInCart(isInCart(product.id));
    const handler = () => setInCart(isInCart(product.id));
    window.addEventListener("storage", handler);
    window.addEventListener("cart-updated", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("cart-updated", handler);
    };
  }, [isInCart, product.id]);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrls: product.imageUrls,
      });
      setAdded(true);
      setInCart(true);
    } catch {
      toast.error("Failed to add to cart");
    }
    setLoading(false);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleRemoveFromCart = async () => {
    setLoading(true);
    try {
      await removeFromCart(product.id);
      setInCart(false);
    } catch {
      toast.error("Failed to remove from cart");
    }
    setLoading(false);
  };

  if (inCart) {
    return (
      <Button size="lg" variant="destructive" className="w-36" onClick={handleRemoveFromCart} disabled={loading}>
        {loading ? "Removing..." : "Remove from Cart"}
      </Button>
    );
  }

  return (
    <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={loading || added}>
      {added ? "Added!" : loading ? "Adding..." : "Add to Cart"}
    </Button>
  );
} 
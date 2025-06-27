"use client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { JsonValue } from "@prisma/client/runtime/library";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrls?: JsonValue;
}

export default function CartItem({ product }: { product: Product }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [inCart, setInCart] = useState(false);

  // Check if product is in cart
  const checkInCart = async () => {
    console.log("Checking cart for product:", product.id, "Session:", !!session?.user);
    if (session?.user) {
      try {
        const res = await fetch("/api/cart?allPending=1");
        const data = await res.json();
        console.log("Cart API response:", data);
        const found = (Array.isArray(data) ? data : [data])
          .flatMap((order: { items: { productId: string }[] }) => order.items || [])
          .some((item: { productId: string }) => item.productId === product.id);
        setInCart(found);
        console.log("Product in cart:", found);
      } catch (error) {
        console.error("Error checking cart:", error);
      }
    } else {
      const cart: { id: string; name: string; price: number; imageUrls?: JsonValue }[] = JSON.parse(localStorage.getItem("cart") || "[]");
      const found = cart.some((item) => item.id === product.id);
      setInCart(found);
      console.log("Product in localStorage cart:", found);
    }
  };

  useEffect(() => {
    checkInCart();
    window.addEventListener("storage", checkInCart);
    window.addEventListener("cart-updated", checkInCart);
    return () => {
      window.removeEventListener("storage", checkInCart);
      window.removeEventListener("cart-updated", checkInCart);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, product.id]);

  const handleAddToCart = async () => {
    console.log("Adding to cart:", product.id);
    setLoading(true);
    try {
      if (session?.user) {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        
        if (!res.ok) {
          const error = await res.json();
          console.error("Cart API error:", error);
          toast.error(error.error || "Failed to add to cart");
          return;
        }
        
        const data = await res.json();
        console.log("Added to cart successfully:", data);
        toast.success("Added to cart!");
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        const cart: { id: string; name: string; price: number; imageUrls?: JsonValue }[] = JSON.parse(localStorage.getItem("cart") || "[]");
        const existingItem = cart.find(item => item.id === product.id);
        if (!existingItem) {
          cart.push({ id: product.id, name: product.name, price: product.price, imageUrls: product.imageUrls });
          localStorage.setItem("cart", JSON.stringify(cart));
          console.log("Added to localStorage cart:", cart);
          toast.success("Added to cart!");
          window.dispatchEvent(new Event("storage"));
        } else {
          toast.info("Already in cart");
        }
      }
      setAdded(true);
      setInCart(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
    setLoading(false);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleRemoveFromCart = async () => {
    console.log("Removing from cart:", product.id);
    setLoading(true);
    try {
      if (session?.user) {
        const res = await fetch(`/api/cart?productId=${product.id}`, { method: "DELETE" });
        if (!res.ok) {
          const error = await res.json();
          console.error("Remove from cart error:", error);
          toast.error(error.error || "Failed to remove from cart");
          return;
        }
        toast.success("Removed from cart!");
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        const cart: { id: string }[] = JSON.parse(localStorage.getItem("cart") || "[]");
        const updated = cart.filter((item) => item.id !== product.id);
        localStorage.setItem("cart", JSON.stringify(updated));
        console.log("Removed from localStorage cart:", updated);
        toast.success("Removed from cart!");
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("cart-updated"));
      }
      setInCart(false);
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove from cart");
    }
    setLoading(false);
  };

  if (inCart) {
    return (
      <Button size="sm" variant="destructive" onClick={handleRemoveFromCart} disabled={loading}>
        {loading ? "Removing..." : "Remove from Cart"}
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={handleAddToCart} disabled={loading || added}>
      {added ? "Added!" : loading ? "Adding..." : "Add to Cart"}
    </Button>
  );
} 
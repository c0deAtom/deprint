"use client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
}

export default function CartItem({ product }: { product: Product }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [inCart, setInCart] = useState(false);

  // Check if product is in cart
  const checkInCart = async () => {
    if (session?.user) {
      const res = await fetch("/api/cart?allPending=1");
      const data = await res.json();
      const found = (Array.isArray(data) ? data : [data])
        .flatMap((order: { items: { productId: string }[] }) => order.items || [])
        .some((item: { productId: string }) => item.productId === product.id);
      setInCart(found);
    } else {
      const cart: { id: string }[] = JSON.parse(localStorage.getItem("cart") || "[]");
      setInCart(cart.some((item) => item.id === product.id));
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
    setLoading(true);
    if (session?.user) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      window.dispatchEvent(new Event("cart-updated"));
    } else {
      const cart: { id: string; name: string; price: number; imageUrl?: string | null }[] = JSON.parse(localStorage.getItem("cart") || "[]");
      if (!cart.find((item) => item.id === product.id)) {
        cart.push({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl });
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("storage"));
      }
    }
    setAdded(true);
    setInCart(true);
    setLoading(false);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleRemoveFromCart = async () => {
    setLoading(true);
    if (session?.user) {
      await fetch(`/api/cart?productId=${product.id}`, { method: "DELETE" });
      window.dispatchEvent(new Event("cart-updated"));
    } else {
      const cart: { id: string }[] = JSON.parse(localStorage.getItem("cart") || "[]");
      const updated = cart.filter((item) => item.id !== product.id);
      localStorage.setItem("cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("cart-updated"));
    }
    setInCart(false);
    setLoading(false);
  };

  if (inCart) {
    return (
      <Button size="sm" variant="destructive" onClick={handleRemoveFromCart} disabled={loading}>
        Remove from Cart
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={handleAddToCart} disabled={loading || added}>
      {added ? "Added!" : loading ? "Adding..." : "Add to Cart"}
    </Button>
  );
} 
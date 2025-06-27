"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CartProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity?: number;
}

export default function CartPage() {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      if (session?.user) {
        // Signed in: fetch all pending orders
        const res = await fetch("/api/cart?allPending=1");
        const data = await res.json();
        // Flatten all items from all orders
        const allItems = (Array.isArray(data) ? data : [data])
          .flatMap((order: { items: { productId: string; product?: { name?: string; imageUrl?: string }; price: number; quantity?: number }[] }) =>
            (order.items || []).map((item: { productId: string; product?: { name?: string; imageUrl?: string }; price: number; quantity?: number }) => ({
              id: item.productId,
              name: item.product?.name || "",
              price: item.price,
              imageUrl: item.product?.imageUrl,
              quantity: item.quantity,
            }))
          );
        setCart(allItems);
      } else {
        // Guest: use localStorage
        const stored = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(stored);
      }
      setLoading(false);
    };
    fetchCart();
    const handler = () => fetchCart();
    window.addEventListener("storage", handler);
    window.addEventListener("cart-updated", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("cart-updated", handler);
    };
  }, [session]);

  const removeFromCart = async (id: string) => {
    if (session?.user) {
      await fetch(`/api/cart?productId=${id}`, { method: "DELETE" });
      const res = await fetch("/api/cart?allPending=1");
      const data = await res.json();
      const allItems = (Array.isArray(data) ? data : [data])
        .flatMap((order: { items: { productId: string; product?: { name?: string; imageUrl?: string }; price: number; quantity?: number }[] }) =>
          (order.items || []).map((item: { productId: string; product?: { name?: string; imageUrl?: string }; price: number; quantity?: number }) => ({
            id: item.productId,
            name: item.product?.name || "",
            price: item.price,
            imageUrl: item.product?.imageUrl,
            quantity: item.quantity,
          }))
        );
      setCart(allItems);
      window.dispatchEvent(new Event("cart-updated"));
    } else {
      const updated = cart.filter(p => p.id !== id);
      setCart(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  return (
    <main className="flex flex-col items-center py-12 px-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Cart</h1>
      {loading ? (
        <div>Loading...</div>
      ) : cart.length === 0 ? (
        <div className="text-muted-foreground">Your cart is empty.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {cart.map(product => (
            <Card key={product.id} className="p-4 flex flex-col gap-2">
              <div className="font-semibold">{product.name}</div>
              <div className="text-sm">${product.price.toFixed(2)}</div>
              {product.quantity && <div className="text-xs text-muted-foreground">Qty: {product.quantity}</div>}
              {product.imageUrl && <Image src={product.imageUrl} alt={product.name} width={96} height={96} className="object-contain mt-2" />}
              <Button variant="destructive" size="sm" onClick={() => removeFromCart(product.id)}>Remove</Button>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
} 
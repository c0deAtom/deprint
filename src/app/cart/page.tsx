"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { JsonValue } from "@prisma/client/runtime/library";

interface CartProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrls?: JsonValue;
}

export default function CartPage() {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      if (session?.user) {
        // Signed in: fetch all pending orders
        const res = await fetch("/api/cart?allPending=1");
        const data = await res.json();
        // Flatten all items from all orders
        const allItems = (Array.isArray(data) ? data : [data])
          .flatMap((order: { items: { productId: string; product?: { name?: string; imageUrls?: JsonValue }; price: number; quantity?: number }[] }) =>
            (order.items || []).map((item: { productId: string; product?: { name?: string; imageUrls?: JsonValue }; price: number; quantity?: number }) => ({
              id: item.productId,
              name: item.product?.name || "Unknown Product",
              price: item.price,
              quantity: item.quantity || 1,
              imageUrls: item.product?.imageUrls,
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
        .flatMap((order: { items: { productId: string; product?: { name?: string; imageUrls?: JsonValue }; price: number; quantity?: number }[] }) =>
          (order.items || []).map((item: { productId: string; product?: { name?: string; imageUrls?: JsonValue }; price: number; quantity?: number }) => ({
            id: item.productId,
            name: item.product?.name || "Unknown Product",
            price: item.price,
            quantity: item.quantity || 1,
            imageUrls: item.product?.imageUrls,
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

  const handleCheckout = async () => {
    if (!session?.user) {
      toast.error("Please sign in to checkout");
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const order = await res.json();
        toast.success(`Order placed successfully! Order #${order.id.slice(-8)}`);
        setCart([]);
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        toast.error("Checkout failed");
      }
    } catch {
      console.error("Failed to fetch cart");
    }
    setCheckoutLoading(false);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <main className="flex flex-col items-center py-12 px-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Cart</h1>
      {loading ? (
        <div>Loading...</div>
      ) : cart.length === 0 ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cart.map(product => (
              <Card key={product.id} className="p-4 flex flex-col gap-2">
                <div className="font-semibold">{product.name}</div>
                <div className="text-sm">${product.price.toFixed(2)}</div>
                {product.quantity && <div className="text-xs text-muted-foreground">Qty: {product.quantity}</div>}
                {Array.isArray(product.imageUrls) && product.imageUrls.length > 0 && <Image src={product.imageUrls[0] as string} alt={product.name} width={96} height={96} className="object-contain mt-2" />}
                <Button variant="destructive" size="sm" onClick={() => removeFromCart(product.id)}>Remove</Button>
              </Card>
            ))}
          </div>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="text-2xl font-bold">${total.toFixed(2)}</div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleCheckout} 
                disabled={checkoutLoading || !session?.user}
                className="flex-1"
                size="lg"
              >
                {checkoutLoading ? "Processing..." : session?.user ? "Quick Checkout" : "Sign in to Checkout"}
              </Button>
              {session?.user && (
                <Button 
                  asChild
                  variant="outline"
                  size="lg"
                >
                  <a href="/checkout">Detailed Checkout</a>
                </Button>
              )}
            </div>
            {!session?.user && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Please sign in to complete your purchase
              </p>
            )}
          </Card>
        </div>
      )}
    </main>
  );
} 
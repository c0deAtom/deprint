"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ImageIcon } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      toast({ title: "Error", description: "Could not load cart.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error();
      fetchCart();
    } catch {
      toast({ title: "Error", description: "Could not update item.", variant: "destructive" });
    }
  }

  async function removeItem(itemId: string) {
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchCart();
    } catch {
      toast({ title: "Error", description: "Could not remove item.", variant: "destructive" });
    }
  }

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
  }

  if (!items.length) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <Button onClick={() => router.push("/products")}>Shop Products</Button>
    </div>;
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {items.map(item => {
            const imageUrl = item.product.images && item.product.images.length > 0 ? item.product.images[0] : null;
            const isValidImage = !!imageUrl && (imageUrl.startsWith('/') || imageUrl.startsWith('http'));

            return (
              <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0">
                <div className="w-16 h-16 rounded overflow-hidden bg-muted flex items-center justify-center">
                  {isValidImage ? (
                    <Image 
                      src={imageUrl}
                      alt={item.product.name} 
                      width={64} 
                      height={64} 
                      className="object-cover w-full h-full" 
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{item.product.name}</div>
                  <div className="text-muted-foreground text-sm">${item.product.price.toFixed(2)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                    <Input type="number" value={item.quantity} min={1} className="w-16 text-center" readOnly />
                    <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    <Button size="icon" variant="destructive" onClick={() => removeItem(item.id)} title="Remove">
                      &times;
                    </Button>
                  </div>
                </div>
                <div className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</div>
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="flex flex-col items-end gap-4">
          <div className="text-lg font-bold">Subtotal: ${total.toFixed(2)}</div>
          <Button onClick={() => router.push("/checkout")} className="w-full max-w-xs">Proceed to Checkout</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 
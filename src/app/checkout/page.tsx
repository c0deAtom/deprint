"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CartProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrls?: string[];
}

interface CheckoutForm {
  name: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
  });

  useEffect(() => {
    if (!session?.user) {
      router.push("/signin?callbackUrl=/checkout");
      return;
    }

    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cart?allPending=1");
        const data = await res.json();
        const allItems = (Array.isArray(data) ? data : [data])
          .flatMap((order: { items: { productId: string; product?: { name?: string; imageUrls?: string[] }; price: number; quantity?: number }[] }) =>
            (order.items || []).map((item: { productId: string; product?: { name?: string; imageUrls?: string[] }; price: number; quantity?: number }) => ({
              id: item.productId,
              name: item.product?.name || "Unknown Product",
              price: item.price,
              quantity: item.quantity || 1,
              imageUrls: item.product?.imageUrls,
            }))
          );
        setCart(allItems);
        
        // Pre-fill form with user data
        if (session?.user) {
          setForm(prev => ({
            ...prev,
            name: session.user?.name || "",
            email: session.user?.email || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Failed to load cart");
      }
      setLoading(false);
    };

    fetchCart();
  }, [session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error("Please sign in to checkout");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate form
    if (!form.name || !form.email || !form.address || !form.city || !form.zipCode || !form.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingInfo: form,
        }),
      });

      if (res.ok) {
        const order = await res.json();
        toast.success(`Order placed successfully! Order #${order.id.slice(-8)}`);
        setCart([]);
        window.dispatchEvent(new Event("cart-updated"));
        router.push(`/orders/${order.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed");
    }
    setCheckoutLoading(false);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = 5.99; // Fixed shipping cost
  const tax = total * 0.08; // 8% tax
  const grandTotal = total + shipping + tax;

  if (loading) {
    return (
      <main className="flex flex-col items-center py-12 px-4 min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading checkout...</div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="flex flex-col items-center py-12 px-4 min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Checkout</h1>
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
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center py-12 px-4 min-h-screen">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Please provide your shipping details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={form.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      {Array.isArray(item.imageUrls) && item.imageUrls.length > 0 && (
                        <Image
                          src={item.imageUrls[0]}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-contain rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${((item.price * (item.quantity || 1)).toFixed(2))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full mt-6"
                  size="lg"
                >
                  {checkoutLoading ? "Processing..." : `Place Order - $${grandTotal.toFixed(2)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
} 
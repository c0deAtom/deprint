"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import type { RazorpayOptions, RazorpayResponse } from "@/types/razorpay";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrls: string[];
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  shippingInfo: {
    name: string;
    email: string;
    address: {
      line1: string;
      state: string;
      city: string;
      pincode: string;
      mobile: string;
    };
  };
  items: OrderItem[];
}

function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided.");
      setLoading(false);
      // Optionally redirect after 2s
      setTimeout(() => router.push("/checkout"), 2000);
      return;
    }
    // Fetch order details
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Order not found.");
          // Optionally redirect after 2s
          setTimeout(() => router.push("/checkout"), 2000);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setError("Failed to fetch order.");
        setTimeout(() => router.push("/checkout"), 2000);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId, router]);

  const handleRazorpay = async () => {
    if (!order) return;
    setPaying(true);
    
    try {
      const res = await fetch("/api/payment/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to initiate payment.");
        setPaying(false);
        return;
      }

      // Initialize Razorpay checkout
      const options: RazorpayOptions = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Your Store Name",
        description: `Order ${order.id}`,
        order_id: data.razorpayOrderId,
        handler: async function (response: RazorpayResponse) {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success("Payment successful! Your order has been confirmed.");
              router.push(`/orders/${order.id}`);
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: order.shippingInfo?.name || "",
          email: order.shippingInfo?.email || "",
          contact: order.shippingInfo?.address?.mobile || "",
        },
        notes: {
          orderId: order.id,
        },
        theme: {
          color: "#10B981",
        },
        modal: {
          ondismiss: function() {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      setError("Failed to initiate payment.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-10">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/checkout">
              <Button>Return to Checkout</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  if (!order.items || order.items.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-10">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">No Items in Order</h2>
            <p className="text-muted-foreground mb-4">This order does not contain any items. Please try again.</p>
            <Link href="/checkout">
              <Button>Return to Checkout</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center px-4 py-10 min-h-screen">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Payment</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Order ID:</span>
                  <span className="font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <span className="capitalize">{order.status.toLowerCase()}</span>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        {item.product.imageUrls && item.product.imageUrls.length > 0 && (
                          <Image
                            src={item.product.imageUrls[0]}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="object-contain rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                {order.shippingInfo ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {order.shippingInfo.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {order.shippingInfo.email}
                    </div>
                    <div>
                      <span className="font-medium">Mobile:</span> {order.shippingInfo.address.mobile}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span>
                      <div className="ml-2 mt-1">
                        {order.shippingInfo.address.line1}<br />
                        {order.shippingInfo.address.city}, {order.shippingInfo.address.state}<br />
                        {order.shippingInfo.address.pincode}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Shipping information not available</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Button */}
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      ₹{order.total.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Secure payment powered by Razorpay
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleRazorpay}
                    disabled={paying}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white text-lg font-semibold py-4"
                    size="lg"
                  >
                    {paying ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      "Pay with Razorpay UPI"
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-3">
                    You&apos;ll be redirected to Razorpay&apos;s secure payment gateway
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentPageWrapper() {
  return (
    <Suspense fallback={<main className="flex flex-col items-center justify-center min-h-screen px-4 py-10"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div><p>Loading payment details...</p></div></main>}>
      <PaymentPage />
    </Suspense>
  );
} 
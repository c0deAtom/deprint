"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Skeleton } from "@/components/ui/skeleton";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
}

interface RazorpayInstance {
  open(): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface CheckoutForm {
  name: string;
  email: string;
  line1: string;
  state: string;
  city: string;
  pincode: string;
  mobile: string;
}

interface AuthForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items: cart, clearCart, getCartTotal, loading: cartLoading } = useCart();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    line1: "",
    state: "",
    city: "",
    pincode: "",
    mobile: "",
  });
  const [authForm, setAuthForm] = useState<AuthForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Don't proceed if session is still loading
    if (status === "loading") {
      return;
    }

    // Show auth forms if user is not signed in
    if (status === "unauthenticated") {
      setShowAuth(true);
      setLoading(false);
      return;
    }

    // Pre-fill form with user data if signed in
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || "",
      }));

      // Fetch user profile to get saved address
      const fetchUserProfile = async () => {
        setAddressLoading(true);
        try {
          const res = await fetch("/api/profile");
          if (res.ok) {
            const data = await res.json();
            if (data.user?.address) {
              setForm(prev => ({
                ...prev,
                line1: data.user.address.line1 || "",
                state: data.user.address.state || "",
                city: data.user.address.city || "",
                pincode: data.user.address.pincode || "",
                mobile: data.user.address.mobile || "",
              }));
            }
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        } finally {
          setAddressLoading(false);
        }
      };

      fetchUserProfile();
    } else {
      setAddressLoading(false);
    }

    setLoading(false);
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (showValidation && e.target.value.trim()) {
      setShowValidation(false);
    }
  };

  const handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    if (authForm.password !== authForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (authForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        }),
      });

      if (res.ok) {
        toast.success("Account created successfully! Signing you in...");
        // Auto sign in after signup
        const result = await signIn("credentials", {
          email: authForm.email,
          password: authForm.password,
          redirect: false,
        });
        
        if (result?.ok) {
          toast.success("Welcome! You can now complete your checkout.");
          setShowAuth(false);
        } else {
          toast.error("Account created but sign in failed. Please sign in manually.");
        }
      } else {
        const error = await res.json();
        toast.error(error.error || "Sign up failed");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Sign up failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    setAuthLoading(true);
    try {
      const result = await signIn("credentials", {
        email: authForm.email,
        password: authForm.password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Signed in successfully!");
        setShowAuth(false);
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Sign in failed");
    } finally {
      setAuthLoading(false);
    }
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
    if (!form.name || !form.email || !form.line1 || !form.state || !form.city || !form.pincode || !form.mobile) {
      setShowValidation(true);
      toast.error("Please fill in all required fields");
      return;
    }
    if (!validatePincode(form.pincode)) {
      setShowValidation(true);
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    if (!validateMobile(form.mobile)) {
      setShowValidation(true);
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setCheckoutLoading(true);
    try {
      const orderRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: getCartTotal(),
        }),
      });

      if (!orderRes.ok) {
        toast.error("Failed to create Razorpay order");
        setCheckoutLoading(false);
        return;
      }

      const order = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: "Your Company Name",
        description: "Test Transaction",
        order_id: order.id,
        handler: async function (response: RazorpayHandlerResponse) {
          const verificationRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verificationData = await verificationRes.json();

          if (verificationData.success) {
            const checkoutRes = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                shippingInfo: {
                  name: form.name,
                  email: form.email,
                  address: {
                    line1: form.line1,
                    state: form.state,
                    city: form.city,
                    pincode: form.pincode,
                    mobile: form.mobile,
                  },
                },
                items: cart.map(item => ({
                  productId: item.productId || item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls.filter((url): url is string => typeof url === 'string') : undefined,
                })),
                paymentInfo: {
                  id: response.razorpay_payment_id,
                  status: "paid",
                  method: "razorpay",
                },
              }),
            });

            if (checkoutRes.ok) {
              const order = await checkoutRes.json();
              setCheckoutSuccess(true);
              toast.success(`Order placed successfully! Order #${order.id}`);
              clearCart();
              window.dispatchEvent(new Event("cart-updated"));
              router.push(`/orders/${order.id}`);
            } else {
              const error = await checkoutRes.json();
              toast.error(error.error || "Checkout failed after payment");
            }
          } else {
            toast.error("Payment verification failed");
          }
        },
        ondismiss: function () {
          toast.info("Payment was cancelled. You can try again.");
          // No order is created, cart remains as is
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.mobile,
        },
        notes: {
          address: `${form.line1}, ${form.city}, ${form.state} - ${form.pincode}`,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An unexpected error occurred during checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const validateMobile = (mobile: string) => /^\d{10}$/.test(mobile);
  const validatePincode = (pincode: string) => /^\d{6}$/.test(pincode);

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = 80; // Updated shipping rate to ₹80
  const grandTotal = total + shipping;

  if (loading || status === "loading" || cartLoading) {
    return (
      <main className="flex flex-col items-center px-4 min-h-screen py-10">
        <div className="w-full max-w-2xl">
          <Card className="p-8">
            <CardHeader>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <div className="flex justify-end mt-6">
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (cart.length === 0 && !checkoutSuccess) {
    return (
      <main className="flex flex-col items-center px-4 py-10 min-h-screen">
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

  if (checkoutSuccess) {
    return (
      <main className="flex flex-col items-center px-4 min-h-screen">
        <div className="text-center">
          <div className="text-lg">Redirecting to order details...</div>
        </div>
      </main>
    );
  }

  // Show auth forms for guest users
  if (showAuth) {
    return (
      <main className="flex flex-col items-center px-4 py-10 min-h-screen">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Order</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isSignUp ? "Create Account" : "Sign In"}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp 
                  ? "Create an account to complete your purchase and track your orders" 
                  : "Sign in to your account to complete your purchase"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                {isSignUp && (
                  <div>
                    <Label htmlFor="auth-name">Full Name *</Label>
                    <Input
                      id="auth-name"
                      name="name"
                      value={authForm.name}
                      onChange={handleAuthInputChange}
                      required
                      className={showValidation && !authForm.name.trim() ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {showValidation && !authForm.name.trim() && (
                      <p className="text-red-500 text-sm mt-1">Full name is required</p>
                    )}
                  </div>
                )}
                
                <div>
                  <Label htmlFor="auth-email">Email *</Label>
                  <Input
                    id="auth-email"
                    name="email"
                    type="email"
                    value={authForm.email}
                    onChange={handleAuthInputChange}
                    required
                    className={showValidation && !authForm.email.trim() ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {showValidation && !authForm.email.trim() && (
                    <p className="text-red-500 text-sm mt-1">Email is required</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="auth-password">Password *</Label>
                  <Input
                    id="auth-password"
                    name="password"
                    type="password"
                    value={authForm.password}
                    onChange={handleAuthInputChange}
                    required
                    className={showValidation && !authForm.password.trim() ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {showValidation && !authForm.password.trim() && (
                    <p className="text-red-500 text-sm mt-1">Password is required</p>
                  )}
                  {showValidation && authForm.password.length > 0 && authForm.password.length < 6 && (
                    <p className="text-red-500 text-sm mt-1">Password must be at least 6 characters</p>
                  )}
                </div>
                
                {isSignUp && (
                  <div>
                    <Label htmlFor="auth-confirmPassword">Confirm Password *</Label>
                    <Input
                      id="auth-confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={authForm.confirmPassword}
                      onChange={handleAuthInputChange}
                      required
                      className={showValidation && (!authForm.confirmPassword.trim() || authForm.confirmPassword !== authForm.password) ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {showValidation && !authForm.confirmPassword.trim() && (
                      <p className="text-red-500 text-sm mt-1">Confirm password is required</p>
                    )}
                    {showValidation && authForm.confirmPassword && authForm.confirmPassword !== authForm.password && (
                      <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                    )}
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm"
                >
                  {isSignUp 
                    ? "Already have an account? Sign in" 
                    : "Don't have an account? Sign up"
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Summary for context */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center px-4 my-10 min-h-screen">
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
                      className={showValidation && !form.name.trim() ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {showValidation && !form.name.trim() && (
                      <p className="text-red-500 text-sm mt-1">Full name is required</p>
                    )}
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
                      className={showValidation && !form.email.trim() ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {showValidation && !form.email.trim() && (
                      <p className="text-red-500 text-sm mt-1">Email is required</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="line1">Street / House *</Label>
                  <Input
                    id="line1"
                    name="line1"
                    value={form.line1}
                    onChange={handleInputChange}
                    required
                    className={showValidation && !form.line1.trim() ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {showValidation && !form.line1.trim() && (
                    <p className="text-red-500 text-sm mt-1">Street address is required</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={handleInputChange}
                      required
                      className={showValidation && !form.state.trim() ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {showValidation && !form.state.trim() && (
                      <p className="text-red-500 text-sm mt-1">State is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                      required
                      className={showValidation && !form.city.trim() ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {showValidation && !form.city.trim() && (
                      <p className="text-red-500 text-sm mt-1">City is required</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleInputChange}
                      required
                      className={showValidation && (!form.pincode.trim() || !validatePincode(form.pincode)) ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {showValidation && !form.pincode.trim() && (
                      <p className="text-red-500 text-sm mt-1">Pincode is required</p>
                    )}
                    {showValidation && form.pincode && !validatePincode(form.pincode) && (
                      <p className="text-red-500 text-sm mt-1">Please enter a valid 6-digit pincode</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleInputChange}
                      placeholder="Enter your mobile number"
                      required
                      className={showValidation && (!form.mobile || !validateMobile(form.mobile)) ? "border-red-500" : ""}
                    />
                    {showValidation && !form.mobile && (
                      <p className="text-red-500 text-sm">Mobile number is required</p>
                    )}
                    {showValidation && form.mobile && !validateMobile(form.mobile) && (
                      <p className="text-red-500 text-sm">Please enter a valid 10-digit mobile number</p>
                    )}
                  </div>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/profile");
                        if (res.ok) {
                          const data = await res.json();
                          if (data.user?.address) {
                            setForm(prev => ({
                              ...prev,
                              line1: data.user.address.line1 || "",
                              state: data.user.address.state || "",
                              city: data.user.address.city || "",
                              pincode: data.user.address.pincode || "",
                              mobile: data.user.address.mobile || "",
                            }));
                            toast.success("Address filled from profile!");
                          } else {
                            toast.info("No saved address found in profile");
                          }
                        }
                      } catch {
                        toast.error("Failed to load saved address");
                      }
                    }}
                  >
                    Use Saved
                  </Button>
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
                          src={item.imageUrls[0] as string}
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
                          ₹{((item.price * (item.quantity || 1)).toFixed(2))}
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
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || addressLoading}
                  className="w-full mt-6"
                  size="lg"
                >
                  {checkoutLoading ? "Processing..." : addressLoading ? "Loading Address..." : `Place Order - ₹${grandTotal.toFixed(2)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
} 
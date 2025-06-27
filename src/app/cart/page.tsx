"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useCartBackend } from "@/hooks/useCartBackend";
import { Trash2, Loader2, ShoppingCart } from "lucide-react";
import { CartItemSkeletonList } from "@/components/CartItemSkeleton";

export default function CartPage() {
  const { data: session } = useSession();
  const { 
    cartItems, 
    loading, 
    error,
    removeFromCart,
    getCartTotal,
    refreshCartDetails
  } = useCartBackend();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [bulkRemoving, setBulkRemoving] = useState(false);

  // Load cart details when component mounts
  useEffect(() => {
    if (session?.user) {
      refreshCartDetails();
    }
  }, [session?.user, refreshCartDetails]);

  const handleItemToggle = (productId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.productId)));
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    try {
      await removeFromCart(productId);
      // Optimistic update - item is already removed from cartItems
      toast.success('Item removed from cart!');
    } catch {
      toast.error('Failed to remove item');
      // Error handling is done in the hook with revert
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleBulkRemove = async () => {
    if (selectedItems.size === 0) return;
    
    setBulkRemoving(true);
    try {
      // Remove items one by one (could be optimized with batch endpoint)
      for (const productId of selectedItems) {
        await removeFromCart(productId);
      }
      setSelectedItems(new Set());
      toast.success(`Removed ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} from cart!`);
    } catch {
      toast.error('Failed to remove some items');
    } finally {
      setBulkRemoving(false);
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
        // Refresh cart details
        await refreshCartDetails();
      } else {
        toast.error("Checkout failed");
      }
    } catch {
      toast.error("Checkout failed");
    }
    setCheckoutLoading(false);
  };

  const total = getCartTotal();
  const selectedTotal = cartItems
    .filter(item => selectedItems.has(item.productId))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (error) {
    return (
      <main className="flex flex-col items-center py-12 px-4 min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading cart: {error}</p>
          <Button onClick={() => refreshCartDetails()}>Retry</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center py-12 px-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Cart</h1>
      {loading ? (
        <div className="w-full max-w-4xl space-y-6">
          {/* Bulk Actions Skeleton */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </Card>
          
          {/* Cart Items Skeleton */}
          <CartItemSkeletonList count={3} />
          
          {/* Order Summary Skeleton */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </Card>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
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
          {/* Bulk Actions */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="select-all-cart"
                  checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                  onCheckedChange={handleSelectAll}
                  disabled={loading}
                />
                <label
                  htmlFor="select-all-cart"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All ({cartItems.length} items)
                </label>
              </div>
              
              {selectedItems.size > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.size} selected • ₹{selectedTotal.toFixed(2)}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkRemove}
                    disabled={bulkRemoving || loading}
                  >
                    {bulkRemoving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Selected
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Cart Items */}
          <div className="grid grid-cols-1 gap-6">
            {cartItems.map(item => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`cart-item-${item.productId}`}
                      checked={selectedItems.has(item.productId)}
                      onCheckedChange={() => handleItemToggle(item.productId)}
                      disabled={loading || removingItems.has(item.productId)}
                    />
                  </div>
                  
                  <div className="relative w-24 h-24 flex-shrink-0">
                    {item.product.imageUrls && Array.isArray(item.product.imageUrls) && item.product.imageUrls.length > 0 ? (
                      <Image
                        src={item.product.imageUrls[0] as string}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-sm">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{item.product.name}</h3>
                      <div className="text-lg font-medium text-green-600 mb-2">
                        ₹{item.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Quantity: {item.quantity}
                      </div>
                      <div className="text-sm font-medium">
                        Total: ₹{((item.price * item.quantity).toFixed(2))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={removingItems.has(item.productId) || loading || bulkRemoving}
                      >
                        {removingItems.has(item.productId) ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Order Summary */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="text-2xl font-bold">₹{total.toFixed(2)}</div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleCheckout} 
                disabled={checkoutLoading || !session?.user || loading || bulkRemoving}
                className="flex-1"
                size="lg"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : session?.user ? (
                  "Quick Checkout"
                ) : (
                  "Sign in to Checkout"
                )}
              </Button>
              {session?.user && (
                <Button 
                  asChild
                  variant="outline"
                  size="lg"
                  disabled={loading || bulkRemoving}
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
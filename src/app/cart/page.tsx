"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { Trash2, Loader2, ShoppingCart } from "lucide-react";
import { CartItemSkeletonList } from "@/components/CartItemSkeleton";

export default function CartPage() {
  const { data: session } = useSession();
  const { 
    items: cartItems, 
    loading, 
    removeFromCart, 
    removeMultipleFromCart, 
    updateQuantity,
    refreshCart,
    getCartSubtotal,
    getCartTotal
  } = useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [bulkRemoving, setBulkRemoving] = useState(false);
  const [updatingQuantities, setUpdatingQuantities] = useState<Set<string>>(new Set());

  // Load cart details when component mounts
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

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
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart!');
    } catch {
      toast.error('Failed to remove item');
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
      await removeMultipleFromCart(Array.from(selectedItems));
      setSelectedItems(new Set());
      toast.success(`Removed ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} from cart!`);
    } catch {
      toast.error('Failed to remove some items');
    } finally {
      setBulkRemoving(false);
    }
  };

  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingQuantities(prev => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQuantity);
      toast.success('Quantity updated!');
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingQuantities(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const total = getCartSubtotal();
  const shipping = 80; // Shipping rate ₹80
  const grandTotal = getCartTotal();
  const selectedTotal = cartItems
    .filter(item => selectedItems.has(item.id))
    .reduce((sum: number, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <main className="flex flex-col items-center px-4 min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading cart: {loading}</p>
          <Button onClick={() => refreshCart()}>Retry</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center px-4 my-10 min-h-screen">
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
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`cart-item-${item.id}`}
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => handleItemToggle(item.id)}
                      disabled={loading || removingItems.has(item.id)}
                    />
                  </div>
                  
                  <div className="relative w-24 h-24 flex-shrink-0">
                    {Array.isArray(item.imageUrls) && typeof item.imageUrls[0] === 'string' && item.imageUrls[0] && (
                      <Image
                        src={item.imageUrls[0]}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-contain rounded"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <div className="text-lg font-medium text-green-600 mb-2">
                        ₹{item.price.toFixed(2)}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Quantity:</span>
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-none border-r"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                            disabled={updatingQuantities.has(item.id) || loading || bulkRemoving || item.quantity <= 1}
                          >
                            {updatingQuantities.has(item.id) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "−"
                            )}
                          </Button>
                          <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-none border-l"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                            disabled={updatingQuantities.has(item.id) || loading || bulkRemoving}
                          >
                            {updatingQuantities.has(item.id) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "+"
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm font-medium">
                        Total: ₹{((item.price * item.quantity).toFixed(2))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removingItems.has(item.id) || loading || bulkRemoving || updatingQuantities.has(item.id)}
                      >
                        {removingItems.has(item.id) ? (
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
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  asChild
                  disabled={loading || bulkRemoving}
                  className="flex-1"
                  size="lg"
                >
                  <a href="/checkout">Checkout</a>
                </Button>
              </div>
              {!session?.user && (
                <p className="text-sm text-muted-foreground text-center">
                  You&apos;ll need to create an account or sign in to complete your purchase
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </main>
  );
} 
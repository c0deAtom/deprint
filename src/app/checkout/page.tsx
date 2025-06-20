"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      const response = await fetch("/api/cart")
      if (!response.ok) throw new Error("Failed to fetch cart")
      const data = await response.json()
      setItems(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsProcessing(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zip: formData.get("zip") as string,
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Checkout failed")

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  if (isLoading) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold mb-8">Loading...</h1>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold mb-8">Your cart is empty</h1>
        <Button onClick={() => router.push("/products")}>
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Input
                    id="name"
                    name="name"
                    placeholder="Full Name"
                    required
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    disabled={isProcessing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  id="address"
                  name="address"
                  placeholder="Address"
                  required
                  disabled={isProcessing}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Input
                    id="city"
                    name="city"
                    placeholder="City"
                    required
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="state"
                    name="state"
                    placeholder="State"
                    required
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="zip"
                    name="zip"
                    placeholder="ZIP Code"
                    required
                    disabled={isProcessing}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
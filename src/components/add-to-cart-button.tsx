"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface AddToCartButtonProps {
  productId: string
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function addToCart() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      })

      if (response.status === 401) {
        toast({
          title: "Not logged in",
          description: "Please log in to add items to your cart.",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) throw new Error("Failed to add to cart")

      toast({
        title: "Success",
        description: (
          <span>
            Product added to cart. <Button variant="link" onClick={() => router.push("/cart")}>Go to cart</Button>
          </span>
        ),
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={addToCart}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? "Adding..." : "Add to Cart"}
    </Button>
  )
} 
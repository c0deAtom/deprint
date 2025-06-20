"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (!sessionId) {
      router.push("/")
      return
    }

    async function clearCart() {
      try {
        const response = await fetch("/api/cart/clear", {
          method: "POST",
        })

        if (!response.ok) throw new Error("Failed to clear cart")
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear cart",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    clearCart()
  }, [searchParams, router, toast])

  if (isLoading) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold mb-8">Processing your order...</h1>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Thank you for your order!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Your order has been successfully placed. We'll send you an email with
            your order details and tracking information.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => router.push("/products")}>
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
} 
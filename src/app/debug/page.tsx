"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function DebugPage() {
  const [cartTest, setCartTest] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);

  const testCartAPI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCartTest(data);
      toast.success("Cart API test successful");
    } catch (error) {
      toast.error("Cart API test failed");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>API Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testCartAPI} disabled={loading}>
            {loading ? "Testing..." : "Test Cart API"}
          </Button>
          
          {cartTest && (
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              {JSON.stringify(cartTest, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
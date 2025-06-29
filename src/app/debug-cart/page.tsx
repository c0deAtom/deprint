"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DebugData {
  action?: string;
  productId?: string;
  result?: unknown;
  [key: string]: unknown;
}

export default function DebugCartPage() {
  const { data: session } = useSession();
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testCartStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cart/status');
      const data = await res.json();
      setDebugData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDebugCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/debug-cart');
      const data = await res.json();
      setDebugData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testAddToCart = async () => {
    setLoading(true);
    setError(null);
    try {
      // First get a product ID
      const productsRes = await fetch('/api/products');
      const products = await productsRes.json();
      
      if (products.length === 0) {
        setError('No products available to test with');
        return;
      }
      
      const productId = products[0].id;
      console.log('Testing with product ID:', productId);
      
      const res = await fetch('/api/cart/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      
      const data = await res.json();
      setDebugData({ action: 'add-to-cart', productId, result: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Cart Debug Page</h1>
      
      <div className="space-y-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded">
              {JSON.stringify(session, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={testCartStatus} disabled={loading}>
            Test Cart Status
          </Button>
          <Button onClick={testDebugCart} disabled={loading}>
            Test Debug Cart
          </Button>
          <Button onClick={testAddToCart} disabled={loading}>
            Test Add to Cart
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {debugData && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 
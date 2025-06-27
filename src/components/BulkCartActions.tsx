"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { JsonValue } from "@prisma/client/runtime/library";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrls?: JsonValue;
}

interface BulkCartActionsProps {
  products: Product[];
  className?: string;
}

export default function BulkCartActions({ products, className }: BulkCartActionsProps) {
  const { addMultipleToCart, isInCart, batchLoading } = useCart();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);

  const availableProducts = products.filter(product => !isInCart(product.id));
  const selectedCount = selectedProducts.size;

  const handleProductToggle = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === availableProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(availableProducts.map(p => p.id)));
    }
  };

  const handleAddSelectedToCart = async () => {
    if (selectedCount === 0) return;

    const productsToAdd = availableProducts.filter(p => selectedProducts.has(p.id));
    await addMultipleToCart(productsToAdd);
    
    setAdded(true);
    setSelectedProducts(new Set());
    setTimeout(() => setAdded(false), 2000);
  };

  if (availableProducts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Bulk Add to Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            All products are already in your cart!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Bulk Add to Cart
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select multiple products to add them all at once
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Select All Option */}
        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
          <Checkbox
            id="select-all"
            checked={selectedProducts.size === availableProducts.length && availableProducts.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All ({availableProducts.length} available)
          </label>
        </div>

        {/* Product List */}
        <div className="max-h-60 overflow-y-auto space-y-2">
          {availableProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Checkbox
                id={product.id}
                checked={selectedProducts.has(product.id)}
                onCheckedChange={() => handleProductToggle(product.id)}
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={product.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {product.name}
                </label>
                <p className="text-sm text-muted-foreground">
                  ₹{product.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleAddSelectedToCart}
            disabled={selectedCount === 0 || batchLoading || added}
            className="w-full"
            size="lg"
          >
            {added ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added Successfully!
              </>
            ) : batchLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding to Cart...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add {selectedCount} Item{selectedCount !== 1 ? 's' : ''} to Cart
              </>
            )}
          </Button>
          
          {selectedCount > 0 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Total: ₹{availableProducts
                .filter(p => selectedProducts.has(p.id))
                .reduce((sum, p) => sum + p.price, 0)
                .toFixed(2)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
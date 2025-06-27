"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { JsonValue } from "@prisma/client/runtime/library";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrls?: JsonValue;
}

interface ProductSearchProps {
  products: Product[];
}

export default function ProductSearch({ products }: ProductSearchProps) {
  const [search, setSearch] = useState("");
  const filteredProducts = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="flex-1 flex flex-col">
      <div className="w-full max-w-2xl mx-auto mt-4 mb-8 px-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded text-base focus:outline-none focus:ring"
        />
      </div>
      
      <div className="flex-1 flex flex-col items-left justify-top px-4 md:px-8">
       
        {filteredProducts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Link href="/products">
              <Button variant="outline" size="lg">
                View All Products
              </Button>
            </Link>
          </>
        )}
        {filteredProducts.length === 0 && (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 
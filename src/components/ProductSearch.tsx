"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { JsonValue } from "@prisma/client/runtime/library";
import { Search } from "lucide-react";

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
    
      {/* Search Section */}
      <div className="w-full max-w-2xl mx-auto mt-8 mb-8 px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
          />
        </div>
      </div>
      
      {/* Products Section */}
      <div className="flex-1 flex flex-col items-left justify-top px-4 md:px-8 pb-8">
        {filteredProducts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center">
              <Link href="/products">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  View All Products
                </Button>
              </Link>
            </div>
          </>
        )}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <p className="text-muted-foreground text-lg">No products found.</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
} 
export const revalidate = 0;

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

import { JsonValue } from "@prisma/client/runtime/library";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrls?: JsonValue;
}

async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return products;
  } catch (error) {
    console.error("Error fetching products from Prisma:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = products; // Show all products on home

  return (
    <div className="min-h-screen flex flex-col">
    
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center">Minimal Ecommerce Store</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl">
          Discover our curated collection of high-quality products designed for modern living.
        </p>
        
        {featuredProducts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
              {featuredProducts.map((product) => (
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
        
        {products.length === 0 && (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No products available yet.</p>
            <Link href="/admin">
              <Button>Add Your First Product</Button>
            </Link>
          </div>
        )}
      </main>
      <footer className="w-full py-6 border-t text-center text-xs text-muted-foreground">© {new Date().getFullYear()} deprint2. All rights reserved.</footer>
    </div>
  );
}

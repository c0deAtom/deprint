import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import Image from "next/image";
import CartItem from "@/components/CartItem";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
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
  const featuredProducts = products.slice(0, 3); // Show only first 3 products on home

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
                <Card key={product.id} className="flex flex-col items-center p-6">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} width={128} height={128} className="w-32 h-32 object-contain mb-4" unoptimized />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center mb-4 text-gray-500">No Image</div>
                  )}
                  <div className="font-semibold mb-2">{product.name}</div>
                  {product.description && (
                    <div className="text-sm text-muted-foreground mb-2 text-center">{product.description}</div>
                  )}
                  <div className="text-muted-foreground mb-4">${product.price.toFixed(2)}</div>
                  <CartItem product={product} />
                </Card>
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

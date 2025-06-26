import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import Image from "next/image";

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

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen flex flex-col">
     
      <main className="flex-1 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">All Products</h1>
            <p className="text-muted-foreground">Discover our complete collection of products</p>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products available yet.</p>
              <Link href="/admin" className="text-blue-600 hover:underline mt-2 inline-block">
                Add your first product →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={256}
                        height={256}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">No Image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                      <Button size="sm">Add to Cart</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <footer className="w-full py-6 border-t text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} deprint2. All rights reserved.
      </footer>
    </div>
  );
} 
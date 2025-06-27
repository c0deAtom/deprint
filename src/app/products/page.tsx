import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { JsonValue } from "@prisma/client/runtime/library";

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

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center">All Products</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl">
          Browse our full collection of high-quality products.
        </p>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No products available yet.</p>
          </div>
        )}
      </main>
      <footer className="w-full py-6 border-t text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} deprint2. All rights reserved.
      </footer>
    </div>
  );
} 
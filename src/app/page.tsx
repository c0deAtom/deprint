export const revalidate = 0;

import { prisma } from "@/lib/db";
import { JsonValue } from "@prisma/client/runtime/library";
import Sidebar from "@/components/Sidebar";
import ProductSearch from "@/components/ProductSearch";

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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col md:flex-row w-full">
        <div className="hidden md:block"><Sidebar /></div>
        <ProductSearch products={products} />
      </main>
      <footer className="w-full py-6 border-t text-center text-xs text-muted-foreground">© {new Date().getFullYear()} deprint2. All rights reserved.</footer>
    </div>
  );
}

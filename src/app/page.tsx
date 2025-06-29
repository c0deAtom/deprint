export const revalidate = 0;

import { prisma } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import ProductSearch from "@/components/ProductSearch";

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<{ category?: string }> 
}) {
  const params = await searchParams;
  const category = params?.category;
  const products = await prisma.product.findMany({
    where: category ? { category } : {},
    orderBy: { createdAt: "desc" },
  });

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

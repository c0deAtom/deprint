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
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Fixed Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main Content - Adjusted for fixed sidebar */}
      <div className="flex-1 md:ml-64 ">
        <main className="flex-1 flex flex-col w-full">
          <ProductSearch products={products} />
        </main>
       
      </div>
    </div>
  );
}

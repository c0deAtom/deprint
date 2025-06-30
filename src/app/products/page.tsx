import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export default async function ProductsPage({ 
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
    <div className="min-h-screen flex flex-col ">
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center">
          {category ? `${category} Products` : "All Products"}
        </h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl">
          {category 
            ? `Browse our collection of ${category.toLowerCase()} products.`
            : "Browse our full collection of high-quality products."
          }
        </p>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {category ? `No ${category.toLowerCase()} products available yet.` : "No products available yet."}
            </p>
          </div>
        )}
      </main>
    
    </div>
  );
} 
import { getProducts } from "@/lib/actions"
import { ProductCard } from "@/components/product-card"

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-8">All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
} 
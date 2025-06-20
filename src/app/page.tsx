import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { getProducts } from "@/lib/actions"
import { Nav } from "@/components/nav"

export default async function Home() {
  const products = await getProducts()

  return (
    <>
     
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center min-h-[60vh] rounded-xl bg-gradient-to-br from-blue-100 via-white to-pink-100 mb-12 overflow-hidden">
          <div className="z-10 text-center max-w-2xl mx-auto py-16">
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Welcome to <span className="text-blue-600">DePrint</span></h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover our collection of premium products. Shop the latest trends and enjoy exclusive deals.
            </p>
            <Button size="lg" className="text-lg px-8 py-6">Shop Now</Button>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200/40 via-transparent to-pink-200/40 pointer-events-none" />
        </section>

        {/* Featured Products */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

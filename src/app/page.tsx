import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6 border-b flex justify-between items-center px-4 md:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight">deprint2</Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/admin" className="hover:underline">Admin</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
          <Link href="/policy" className="hover:underline">Policy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center">Minimal Ecommerce Store</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col items-center p-6">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-32 h-32 object-contain mb-4" />
              ) : (
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center mb-4 text-gray-500">No Image</div>
              )}
              <div className="font-semibold mb-2">{product.name}</div>
              {product.description && (
                <div className="text-sm text-muted-foreground mb-2 text-center">{product.description}</div>
              )}
              <div className="text-muted-foreground mb-4">${product.price.toFixed(2)}</div>
              <Button className="w-full">Add to Cart</Button>
            </Card>
          ))}
        </div>
      </main>
      <footer className="w-full py-6 border-t text-center text-xs text-muted-foreground">© {new Date().getFullYear()} deprint2. All rights reserved.</footer>
    </div>
  );
}

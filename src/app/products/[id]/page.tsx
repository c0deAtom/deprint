import { prisma } from '@/lib/db';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CartItemClientWrapper from '@/components/CartItemClientWrapper';

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return notFound();

  return (
    <main className="flex flex-col items-center py-12 px-4 min-h-screen">
      <Card className="max-w-xl w-full p-8 flex flex-col items-center gap-6">
        {product.imageUrl && product.imageUrl.trim() !== '' ? (
          <Image src={product.imageUrl} alt={product.name} width={256} height={256} className="object-contain rounded" />
        ) : (
          <div className="w-64 h-64 bg-gray-100 flex items-center justify-center text-gray-400 text-lg">No Image</div>
        )}
        <div className="w-full flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          {product.description && <p className="text-muted-foreground mb-4 text-center">{product.description}</p>}
          <div className="text-xl font-semibold mb-4">${product.price.toFixed(2)}</div>
          <div className="flex gap-4">
            <CartItemClientWrapper product={product} />
            <Button variant="default" size="sm">Buy Now</Button>
          </div>
        </div>
        <div className="w-full text-center text-xs text-muted-foreground mt-4">
          Product ID: {product.id}
        </div>
      </Card>
    </main>
  );
} 
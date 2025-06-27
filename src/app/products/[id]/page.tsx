import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import CartItemClientWrapper from '@/components/CartItemClientWrapper';
import BuyNowButton from '@/components/BuyNowButton';
import ProductImageCarousel from '@/components/ProductImageCarousel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Page(props: any) {
  const { params } = props;
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return notFound();

  return (
    <main className="flex flex-col items-center py-12 px-4 min-h-screen">
      <div className="w-full max-w-8xl bg-white rounded-lg shadow flex flex-col md:flex-row gap-8 p-6 md:p-12">
        {/* Image carousel left (or top on mobile) */}
        <div className="md:w-1/2 w-full flex items-center justify-center">
          {Array.isArray(product.imageUrls) && product.imageUrls.length > 0 ? (
            <ProductImageCarousel images={product.imageUrls as string[]} alt={product.name} className="w-full aspect-square max-w-md" />
          ) : (
            <div className="w-full aspect-square max-w-md bg-gray-100 flex items-center justify-center text-gray-400 text-lg rounded">No Image</div>
          )}
        </div>
        {/* Info and actions right */}
        <div className="md:w-1/2 w-full flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4 text-center md:text-left">{product.name}</h1>
          <div className="text-2xl font-semibold text-green-700 mb-4 text-center md:text-left">${product.price.toFixed(2)}</div>
          {product.description && <p className="text-muted-foreground mb-6 text-center md:text-left text-base leading-relaxed">{product.description}</p>}
          <div className="flex gap-4 w-full mt-2">
            <div className="flex-1"><CartItemClientWrapper product={product} /></div>
            <div className="flex-1"><BuyNowButton product={product} /></div>
          </div>
          <div className="text-xs text-muted-foreground mt-8 text-center md:text-left">Product ID: {product.id}</div>
        </div>
      </div>
    </main>
  );
} 
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import CartItemClientWrapper from '@/components/CartItemClientWrapper';
import BuyNowButton from '@/components/BuyNowButton';
import ProductImageCarousel from '@/components/ProductImageCarousel';
import { Badge } from '@/components/ui/badge';
import ProductComments from '@/components/ProductComments';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Leaf, CheckCircle, FlaskConical, Heart, Truck } from 'lucide-react';
import ProductRating from '@/components/ProductRating';

export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({ where: { id: resolvedParams.id } });
  if (!product) return notFound();

  // Example sizes (replace with real data if available)
  const sizes = ["100g", "1.9KG"];

  return (
    <div>
      <main className="flex flex-col items-center px-4 min-h-screen">
        <div className="w-full max-w-8xl bg-white rounded-lg shadow flex flex-col md:flex-row gap-8 p-6 md:p-12">
          {/* Image carousel left */}
          <div className="md:w-2/3 w-full flex flex-col items-center justify-center md:pr-8">
            {Array.isArray(product.imageUrls) && product.imageUrls.length > 0 ? (
              <ProductImageCarousel images={product.imageUrls as string[]} alt={product.name} className="w-full aspect-square max-w-2xl" />
            ) : (
              <div className="w-full aspect-square max-w-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-2xl rounded">No Image</div>
            )}
          </div>
          {/* Info and actions right */}
          <div className="md:w-1/3 w-full flex flex-col justify-center gap-6">
            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold text-center md:text-left">{product.name}</h1>
                <ProductRating productId={product.id} />
              </div>
              {product.category && (
                <Badge variant="secondary" className="mb-3 w-fit self-center md:self-start">
                  {product.category}
                </Badge>
              )}
              <div className="text-2xl font-semibold text-green-700 mb-2 text-center md:text-left">₹{product.price.toFixed(2)}</div>
            </div>
            {/* Size selector */}
            <div className="flex items-center gap-4 mb-2">
              <span className="font-medium">Size</span>
              <Select defaultValue={sizes[0]}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-4">
              <span className="font-medium">Qty</span>
              <Input type="number" min={1} defaultValue={1} className="w-20" />
            </div>
            {/* Add to cart button */}
            <div className="flex gap-3 w-full mb-2">
              <div className="flex-1">
                <CartItemClientWrapper product={product} />
              </div>
              <div className="flex-1">
                <BuyNowButton product={product} />
              </div>
            </div>
           
            {/* Feature icons */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4 mb-2">
              <div className="flex flex-col items-center text-xs">
                <Leaf className="w-6 h-6 text-green-600 mb-1" />
                100% Natural
              </div>
              <div className="flex flex-col items-center text-xs">
                <CheckCircle className="w-6 h-6 text-blue-600 mb-1" />
                GMO Free
              </div>
              <div className="flex flex-col items-center text-xs">
                <FlaskConical className="w-6 h-6 text-purple-600 mb-1" />
                Tested Only on People
              </div>
              <div className="flex flex-col items-center text-xs">
                <Heart className="w-6 h-6 text-pink-600 mb-1" />
                Vegan
              </div>
              <div className="flex flex-col items-center text-xs">
                <Truck className="w-6 h-6 text-gray-600 mb-1" />
                Made in Canada
              </div>
            </div>
          </div>
        </div>
        <div className="text-base text-muted-foreground bg-gray-50 rounded p-4 mb-2">
              {product.description || 'No description available.'}
            </div>
       
        
      </main>
      <ProductComments productId={product.id} />
    </div>
  );
} 
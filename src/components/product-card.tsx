import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { ImageIcon } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
  const isValidImage = !!imageUrl && (imageUrl.startsWith('/') || imageUrl.startsWith('http'));

  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square">
          {isValidImage ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>
      <CardHeader>
        <Link href={`/products/${product.id}`} className="hover:underline">
          <h3 className="text-lg font-semibold">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">{product.category}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-2">{product.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            {product.stock} in stock
          </p>
        </div>
        <AddToCartButton productId={product.id} />
      </CardFooter>
    </Card>
  )
} 
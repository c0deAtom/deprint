import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { ImageIcon } from "lucide-react"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  })

  if (!product) {
    notFound()
  }

  const p: any = product;
  const imageUrl = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
  const isValidImage = !!imageUrl && (imageUrl.startsWith('/') || imageUrl.startsWith('http'));
  const stock = typeof p.stock === "number" ? p.stock : 0;

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square">
          {isValidImage ? (
            <Image
              src={imageUrl}
              alt={p.name}
              fill
              className="object-cover rounded-lg"
              priority
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
              <ImageIcon className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{p.name}</h1>
          <p className="text-2xl font-semibold">${p.price.toFixed(2)}</p>
          <p className="text-muted-foreground">{p.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Category:</span>
            <span className="text-sm font-medium">{p.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Stock:</span>
            <span className="text-sm font-medium">{stock} available</span>
          </div>
          <AddToCartButton productId={p.id} />
        </div>
      </div>
    </div>
  )
} 
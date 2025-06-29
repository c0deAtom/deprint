'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonValue } from "@prisma/client/runtime/library";
import BuyNowButton from "@/components/BuyNowButton";
import CartItem from "@/components/CartItem";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrls?: JsonValue;
    category?: string | null;
  };
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [index, setIndex] = useState(0);
  const images = Array.isArray(product.imageUrls) ? product.imageUrls : [];
  const hasMultiple = images.length > 1;

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <Card className={`p-4 flex flex-col h-full ${className || ''}`}>
      <Link href={`/products/${product.id}`} className="flex-1 flex flex-col">
        {images.length > 0 ? (
          <div className="relative w-full aspect-square mb-4">
            <Image
              src={images[index] as string}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
            {hasMultiple && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-white"
                  aria-label="Previous image"
                  tabIndex={-1}
                >&#8592;</button>
                <button
                  onClick={next}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-white"
                  aria-label="Next image"
                  tabIndex={-1}
                >&#8594;</button>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <span key={i} className={`block w-2 h-2 rounded-full ${i === index ? "bg-primary" : "bg-gray-300"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-32 h-32 bg-gray-200 flex items-center justify-center mb-4 text-gray-500">No Image</div>
        )}
        <div className="w-full flex flex-col items-start flex-1">
          <h2 className="text-2xl font-bold text-left mb-1 w-full">{product.name}</h2>
          {product.category && (
            <Badge variant="secondary" className="mb-2 w-fit">
              {product.category}
            </Badge>
          )}
          {product.description && (
            <div className="text-s text-muted-foreground mb-2 h-24 text-left w-full line-clamp-4 break-words">{product.description}</div>
          )}
          <div className="text-3xl font-bold text-green-700  w-full text-left">₹{product.price.toFixed(2)}</div>
        </div>
      </Link>
      <div className="flex gap-2 w-full mt-auto">
        <div className="flex-1"><CartItem product={product} /></div>
        <div className="flex-1"><BuyNowButton product={product} /></div>
      </div>
    </Card>
  );
} 
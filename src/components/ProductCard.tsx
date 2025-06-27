'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
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
  };
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const images = Array.isArray(product.imageUrls) ? product.imageUrls : [];
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;
  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    setIndex(i => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    setIndex(i => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <Card className={`flex flex-col items-center p-2 cursor-pointer hover:shadow-lg transition-shadow ${className || ""}`}>
      <Link href={`/products/${product.id}`} className="w-full flex flex-col items-center hover:no-underline">
        {images.length > 0 ? (
          <div className="relative w-full aspect-square mb-4 flex items-center justify-center">
            <Image
              src={images[index] as string}
              alt={product.name}
              fill
              sizes="100vw"
              className="object-cover rounded"
              unoptimized
              priority
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
          {product.description && (
            <div className="text-s text-muted-foreground mb-2 text-left w-full line-clamp-4 break-words">{product.description}</div>
          )}
          <div className="text-3xl font-bold text-green-700 mb-4 w-full text-left">₹{product.price.toFixed(2)}</div>
        </div>
      </Link>
      <div className="flex gap-2 w-full mt-auto">
        <div className="flex-1"><CartItem product={product} /></div>
        <div className="flex-1"><BuyNowButton product={product} /></div>
      </div>
    </Card>
  );
} 
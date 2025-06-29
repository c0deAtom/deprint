'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonValue } from "@prisma/client/runtime/library";
import BuyNowButton from "@/components/BuyNowButton";
import CartItem from "@/components/CartItem";
import { Star, ShoppingBag } from "lucide-react";

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

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIndex((i) => (i + 1) % images.length);
  };
  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <Card className={`p-6 flex flex-col h-full group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 shadow-lg ${className || ''}`}>
      <div className="flex-1 flex flex-col">
        {images.length > 0 ? (
          <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-xl">
            <Link href={`/products/${product.id}`} className="block w-full h-full">
              <Image
                src={images[index] as string}
                alt={product.name}
                fill
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </Link>
            {hasMultiple && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 z-10"
                  aria-label="Previous image"
                  tabIndex={-1}
                >&#8592;</button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 z-10"
                  aria-label="Next image"
                  tabIndex={-1}
                >&#8594;</button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {images.map((_, i) => (
                    <span key={i} className={`block w-2 h-2 rounded-full transition-all duration-200 ${i === index ? "bg-blue-500" : "bg-white/60"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href={`/products/${product.id}`} className="block w-full">
            <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 rounded-xl">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
          </Link>
        )}
        <Link href={`/products/${product.id}`} className="flex-1 flex flex-col">
          <div className="w-full flex flex-col items-start flex-1">
            <h2 className="text-xl font-bold text-left mb-2 w-full group-hover:text-blue-600 transition-colors duration-200">{product.name}</h2>
            {product.category && (
              <Badge className="mb-3 w-fit bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                {product.category}
              </Badge>
            )}
            {product.description && (
              <div className="text-sm text-muted-foreground mb-4 h-4 text-left w-full line-clamp-3 break-words">{product.description}</div>
            )}
            <div className="flex items-center justify-between w-full mt-auto">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ₹{product.price.toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">4.8</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex gap-3 w-full mt-6">
        <div className="flex-1">
          <CartItem product={product} />
        </div>
        <div className="flex-1">
          <BuyNowButton product={product} />
        </div>
      </div>
    </Card>
  );
} 
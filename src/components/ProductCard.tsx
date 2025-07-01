'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonValue } from "@prisma/client/runtime/library";
import BuyNowButton from "@/components/BuyNowButton";
import CartItem from "@/components/CartItem";
import { Star, ShoppingBag, PlayCircle } from "lucide-react";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const images = Array.isArray(product.imageUrls) ? product.imageUrls : [];
  const hasMultiple = images.length > 1;

  // Fetch real average rating
  const [average, setAverage] = useState<number | null>(null);
  useEffect(() => {
    fetch(`/api/products/${product.id}/rating`).then(res => res.json()).then(data => setAverage(data.average ?? null));
  }, [product.id]);

  const navigate = (direction: 'next' | 'prev') => {
    setIsPlaying(false);
    if (direction === 'next') {
      setIndex((i) => (i + 1) % images.length);
    } else {
      setIndex((i) => (i - 1 + images.length) % images.length);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <Card className={`p-2 flex flex-col h-full bg-white border border-gray-200 ${className || ''}`}>
      <div className="flex-1 flex flex-col">
        {images.length > 0 ? (
          <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-md flex items-center justify-center bg-gray-100">
            <Link href={`/products/${product.id}`} className="block w-full h-full">
              {(() => {
                const currentMedia = images[index] as string;
                const isVideo = currentMedia.match(/\.(mp4|webm|mov|avi)$/i);
                if (isVideo) {
                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <video
                        ref={videoRef}
                        src={currentMedia}
                        className="w-full h-full object-contain rounded-md"
                        loop
                        onEnded={() => setIsPlaying(false)}
                        onPause={() => setIsPlaying(false)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if(isPlaying) videoRef.current?.pause();
                        }}
                      />
                      {!isPlaying && (
                        <button
                          className="absolute inset-0 flex items-center justify-center bg-black/20"
                          onClick={handlePlay}
                          aria-label="Play video"
                          tabIndex={-1}
                        >
                          <PlayCircle className="w-12 h-12 text-white/90" />
                        </button>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <Image
                      src={currentMedia}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  );
                }
              })()}
            </Link>
            {hasMultiple && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('prev'); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-7 h-7 flex items-center justify-center text-gray-700 border border-gray-300"
                  aria-label="Previous media"
                  tabIndex={-1}
                >&#8592;</button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('next'); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-7 h-7 flex items-center justify-center text-gray-700 border border-gray-300"
                  aria-label="Next media"
                  tabIndex={-1}
                >&#8594;</button>
              </>
            )}
          </div>
        ) : (
          <Link href={`/products/${product.id}`} className="block w-full">
            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded-md">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
          </Link>
        )}
        <Link href={`/products/${product.id}`} className="flex-1 flex flex-col mt-2">
          <div className="w-full flex flex-col items-start flex-1">
            <h2 className="text-lg font-semibold text-left mb-1 w-full">{product.name}</h2>
            {product.category && (
              <Badge className="mb-2 w-fit bg-gray-200 text-gray-700 border-0 text-xs font-normal">
                {product.category}
              </Badge>
            )}
            {product.description && (
              <div className="text-xs text-muted-foreground mb-2 h-4 text-left w-full line-clamp-2 break-words">{product.description}</div>
            )}
            <div className="flex items-center justify-between w-full mt-auto">
              <div className="text-lg font-bold text-gray-900">
                ₹{product.price.toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-medium">
                  {average !== null ? average.toFixed(1) : 'No rating'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex gap-2 w-full mt-3">
        <div className="flex-1 min-w-0">
          <CartItem product={product} />
        </div>
        <div className="flex-1 min-w-0">
          <BuyNowButton product={product} />
        </div>
      </div>
    </Card>
  );
} 
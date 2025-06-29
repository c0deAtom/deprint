"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ProductImageCarousel({ images, alt, className }: { images: string[]; alt: string; className?: string }) {
  const [index, setIndex] = useState(0);
  if (!images || images.length === 0) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>;
  }
  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };
  const goToImage = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIndex(i);
  };
  return (
    <div className={`relative w-full h-full flex flex-col items-center ${className || ""}`}>
      <div className="relative w-full aspect-square flex items-center justify-center">
        <Image
          src={images[index]}
          alt={alt}
          fill
          className="object-contain rounded"
          unoptimized
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
        {images.length > 1 && (
          <>
            <Button size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 z-10" onClick={prev} aria-label="Previous image">
              &#8592;
            </Button>
            <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 z-10" onClick={next} aria-label="Next image">
              &#8594;
            </Button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-2">
          {images.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full ${i === index ? "bg-primary" : "bg-gray-300"}`}
              onClick={(e) => goToImage(e, i)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
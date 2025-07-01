"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ProductImageCarousel({ images, alt, className }: { images: string[]; alt: string; className?: string }) {
  const [index, setIndex] = useState(0);
  if (!images || images.length === 0) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Media</div>;
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
  
  const currentMedia = images[index];
  const isVideo = currentMedia.match(/\.(mp4|webm|mov|avi)$/i);
  
  return (
    <div className={`relative w-full h-full flex flex-col items-center ${className || ""}`}>
      <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
        {isVideo ? (
          <video
            src={currentMedia}
            className="absolute inset-0 w-full h-full max-w-full max-h-full object-contain rounded"
            controls
            muted
            loop
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        ) : (
          <Image
            src={currentMedia}
            alt={alt}
            fill
            className="object-contain rounded"
            unoptimized
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        )}
        {images.length > 1 && (
          <>
            <Button size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 z-10" onClick={prev} aria-label="Previous media">
              &#8592;
            </Button>
            <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 z-10" onClick={next} aria-label="Next media">
              &#8594;
            </Button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-4">
          {images.map((img, i) => {
            const isThumbVideo = img.match(/\.(mp4|webm|mov|avi)$/i);
            return (
              <button
                key={i}
                className={`relative w-16 h-16 rounded overflow-hidden border-2 ${i === index ? 'border-blue-500' : 'border-gray-200'}`}
                onClick={e => goToImage(e, i)}
                aria-label={`Go to media ${i + 1}`}
              >
                {isThumbVideo ? (
                  <>
                    <video
                      src={img}
                      className="w-full h-full object-cover"
                      muted
                      tabIndex={-1}
                    />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded">▶</span>
                  </>
                ) : (
                  <Image
                    src={img}
                    alt={alt}
                    fill
                    className="object-cover"
                    unoptimized
                    tabIndex={-1}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
} 
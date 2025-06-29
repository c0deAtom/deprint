"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

export default function ProductImageCarousel({ images, alt, className }: { images: string[]; alt: string; className?: string }) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  if (!images || images.length === 0) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Media</div>;
  }
  
  const currentMedia = images[index];
  const isVideo = currentMedia.includes('.mp4') || currentMedia.includes('.mov') || currentMedia.includes('.avi') || currentMedia.includes('.webm') || currentMedia.includes('.mkv');
  
  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    setIsPlaying(false);
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    setIsPlaying(false);
  };
  const goToImage = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIndex(i);
    setIsPlaying(false);
  };
  
  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIsPlaying(!isPlaying);
  };
  
  return (
    <div className={`relative w-full h-full flex flex-col items-center ${className || ""}`}>
      <div className="relative w-full aspect-square flex items-center justify-center">
        {isVideo ? (
          <video
            src={currentMedia}
            className="w-full h-full object-contain rounded"
            muted
            loop
            autoPlay={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
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
        
        {/* Video Play/Pause Button */}
        {isVideo && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 left-2 z-20 bg-black/50 hover:bg-black/70 text-white"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
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
        <div className="flex gap-2 mt-2">
          {images.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full ${i === index ? "bg-primary" : "bg-gray-300"}`}
              onClick={(e) => goToImage(e, i)}
              aria-label={`Go to media ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
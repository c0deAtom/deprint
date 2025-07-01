"use client";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

export default function ProductRating({ productId }: { productId: string }) {
  const [average, setAverage] = useState<number | null>(null);
  useEffect(() => {
    fetch(`/api/products/${productId}/rating`).then(res => res.json()).then(data => setAverage(data.average ?? 0));
  }, [productId]);
  const rating = average ?? 0;
  return (
    <div className="flex items-center gap-1 ">
      {[1,2,3,4,5].map((star) => (
        <Star key={star} className={`w-5 h-5 ${rating >= star ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'}`} fill={rating >= star ? 'currentColor' : 'none'} />
      ))}
      <span className="text-yellow-600 text-base font-medium ml-1">{rating.toFixed(1)} / 5</span>
    </div>
  );
} 
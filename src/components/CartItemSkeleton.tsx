import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartItemSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="flex items-start space-x-3">
          <Skeleton className="w-4 h-4 rounded" />
        </div>
        
        <Skeleton className="w-24 h-24 rounded-md flex-shrink-0" />
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="mt-4">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CartItemSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CartItemSkeleton key={index} />
      ))}
    </div>
  );
} 
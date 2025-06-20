import { Skeleton } from "@/components/ui/skeleton"

export default function ProductLoading() {
  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
} 
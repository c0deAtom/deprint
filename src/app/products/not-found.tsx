import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProductsNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-2xl font-bold">Page Not Found</h2>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  )
} 
"use client"

import { useState } from "react"
import { Trash, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Product } from "./columns"
import { ProductForm } from "./product-form"

interface ProductActionsProps {
  product: Product
  onEditSuccess: (product: Product) => void
  onDeleteSuccess: (productId: string) => void
}

export function ProductActions({ product, onEditSuccess, onDeleteSuccess }: ProductActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete product")

      toast.success("Product deleted successfully")
      setIsDeleteDialogOpen(false)
      onDeleteSuccess(product.id)
    } catch (error) {
      toast.error("Failed to delete product")
    }
  }

  const handleEditSuccess = (updatedProduct: Product) => {
    onEditSuccess(updatedProduct)
    setIsEditDialogOpen(false)
  }

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to your product here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <ProductForm product={product} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              product and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
} 
"use client"

import { useState, useEffect } from "react"
import { PlusCircle } from "lucide-react"
import { toast } from "sonner"

import { columns, Product } from "./components/columns"
import { DataTable } from "./components/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProductForm } from "./components/product-form"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        toast.error("Failed to load products.");
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleProductAdded = (newProduct: Product) => {
    setProducts(currentProducts => [newProduct, ...currentProducts])
    setIsAddDialogOpen(false)
  }

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(currentProducts => 
      currentProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    )
  }

  const handleProductDeleted = (deletedProductId: string) => {
    setProducts(currentProducts => 
      currentProducts.filter(p => p.id !== deletedProductId)
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new product.
              </DialogDescription>
            </DialogHeader>
            <ProductForm onSuccess={handleProductAdded} />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading products...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={products} 
          onProductUpdate={handleProductUpdated}
          onProductDelete={handleProductDeleted}
        />
      )}
    </div>
  )
} 
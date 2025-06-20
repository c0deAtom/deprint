"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/image-upload"
import { toast } from "sonner"
import { Product } from "./columns"

interface ProductFormProps {
  product?: Product | null
  onSuccess: (product: Product) => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price.toString() || "",
    category: product?.category || "",
    stock: product?.stock.toString() || "",
    images: product?.images || [],
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      }

      const url = product
        ? `/api/products/${product.id}`
        : "/api/products"
      const method = product ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) throw new Error("Failed to save product")

      const savedProduct = await response.json()

      toast.success(
        `Product ${product ? "updated" : "created"} successfully`
      )
      onSuccess(savedProduct)
    } catch (error) {
      toast.error("Failed to save product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        />
      </div>

      <ImageUpload
        value={formData.images}
        onChange={(urls) => setFormData({ ...formData, images: urls })}
      />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : (product ? "Save Changes" : "Create Product")}
      </Button>
    </form>
  )
} 
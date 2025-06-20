"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    images: [] as string[],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: formData.images,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error("Failed to save product");

      toast.success(
        `Product ${editingProduct ? "updated" : "created"} successfully`
      );
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      images: product.images,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      images: [],
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Product Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </CardTitle>
          </CardHeader>
          <CardContent>
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

              <ImageUpload
                value={formData.images}
                onChange={(urls) => setFormData({ ...formData, images: urls })}
                multiple={true}
                maxFiles={5}
              />

              <div className="flex gap-4">
                <Button type="submit">
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
                {editingProduct && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Existing Products</h2>
          <div className="space-y-8">
            {products.map((product) => {
              const imageUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
              const isValidImage = !!imageUrl && (imageUrl.startsWith('/') || imageUrl.startsWith('http'));

              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="relative aspect-square w-full h-64 md:h-auto">
                      {isValidImage ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="object-cover w-full h-full rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{product.name}</h3>
                        <p className="text-muted-foreground">{product.category}</p>
                      </div>
                      <p className="text-sm line-clamp-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.stock} in stock
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 
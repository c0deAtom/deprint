"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string" || url.trim() === "") return false;
  // Accept relative paths or http(s) URLs
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", imageUrl: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "", imageUrl: "" });
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      toast.error("Error fetching products");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
      if (res.ok) {
        const newProduct = await res.json();
        setProducts([newProduct, ...products]);
        setForm({ name: "", description: "", price: "", imageUrl: "" });
        toast.success("Product added successfully!");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add product");
      }
    } catch (error) {
      toast.error("Error adding product");
    }
    setLoading(false);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      imageUrl: product.imageUrl || "",
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, price: parseFloat(editForm.price) }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map(p => (p.id === updated.id ? updated : p)));
        setEditProduct(null);
        toast.success("Product updated!");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update product");
      }
    } catch (error) {
      toast.error("Error updating product");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${deleteProduct.id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== deleteProduct.id));
        setDeleteProduct(null);
        toast.success("Product deleted!");
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("Error deleting product");
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center py-12 px-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <Card className="w-full max-w-md p-6 mb-8">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
          <Input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <Input name="price" placeholder="Price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
          <Input name="imageUrl" placeholder="Image URL" value={form.imageUrl} onChange={handleChange} />
          <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Product"}</Button>
        </form>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {products.map(product => (
          <Card key={product.id} className="p-4 flex flex-col gap-2 relative">
            <div className="font-semibold">{product.name}</div>
            <div className="text-sm text-muted-foreground">{product.description}</div>
            <div className="text-sm">${product.price.toFixed(2)}</div>
            {isValidImageUrl(product.imageUrl) ? (
              <Image src={product.imageUrl!} alt={product.name} width={96} height={96} className="object-contain mt-2" />
            ) : (
              <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-gray-400 text-xs mt-2">No Image</div>
            )}
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(product)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => setDeleteProduct(product)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      {/* Edit Modal */}
      <Dialog open={!!editProduct} onOpenChange={v => !v && setEditProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleEditSubmit}>
            <Input name="name" placeholder="Product Name" value={editForm.name} onChange={handleEditChange} required />
            <Input name="description" placeholder="Description" value={editForm.description} onChange={handleEditChange} />
            <Input name="price" placeholder="Price" type="number" step="0.01" value={editForm.price} onChange={handleEditChange} required />
            <Input name="imageUrl" placeholder="Image URL" value={editForm.imageUrl} onChange={handleEditChange} />
            <DialogFooter>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProduct} onOpenChange={v => !v && setDeleteProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete <b>{deleteProduct?.name}</b>?</p>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button>
            <Button variant="outline" onClick={() => setDeleteProduct(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
} 
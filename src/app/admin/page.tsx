"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", imageUrl: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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
        setMessage("Product added successfully!");
      } else {
        const error = await res.json();
        setMessage(`Error: ${error.error || 'Failed to add product'}`);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage("Error: Failed to add product");
    }
    
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center py-12 px-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      
      {message && (
        <div className={`w-full max-w-md p-3 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
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
          <Card key={product.id} className="p-4 flex flex-col gap-2">
            <div className="font-semibold">{product.name}</div>
            <div className="text-sm text-muted-foreground">{product.description}</div>
            <div className="text-sm">${product.price.toFixed(2)}</div>
            {product.imageUrl && <Image src={product.imageUrl} alt={product.name} width={96} height={96} className="object-contain mt-2" />}
          </Card>
        ))}
      </div>
    </main>
  );
} 
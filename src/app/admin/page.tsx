"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import { Package, ShoppingCart, DollarSign, AlertCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrls?: string[];
  createdAt: string;
}

interface Order {
  id: string;
  userId: string;
  user: {
    email: string;
    name?: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
    case 'SHIPPED': return 'bg-purple-100 text-purple-800';
    case 'DELIVERED': return 'bg-green-100 text-green-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [form, setForm] = useState({ name: "", description: "", price: "", imageUrls: "" });
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "", imageUrls: "" });
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const fetchData = useCallback(async () => {
    await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchStats()
    ]);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch {
      toast.error("Error fetching products");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch {
      toast.error("Error fetching orders");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      console.error("Error fetching stats");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const imageUrlsArr = form.imageUrls.split(',').map(url => url.trim()).filter(Boolean);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price), imageUrls: imageUrlsArr }),
      });
      if (res.ok) {
        const newProduct = await res.json();
        setProducts([newProduct, ...products]);
        setForm({ name: "", description: "", price: "", imageUrls: "" });
        toast.success("Product added successfully!");
        fetchStats();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add product");
      }
    } catch {
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
      imageUrls: Array.isArray(product.imageUrls) ? product.imageUrls.join(', ') : "",
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
      const imageUrlsArr = editForm.imageUrls.split(',').map(url => url.trim()).filter(Boolean);
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, price: parseFloat(editForm.price), imageUrls: imageUrlsArr }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map(p => (p.id === updated.id ? updated : p)));
        setEditProduct(null);
        toast.success("Product updated!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update product");
      }
    } catch {
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
        fetchStats();
      } else {
        toast.error("Failed to delete product");
      }
    } catch {
      toast.error("Error deleting product");
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: status as 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' } : order
        ));
        toast.success("Order status updated!");
        fetchStats();
      } else {
        toast.error("Failed to update order status");
      }
    } catch {
      toast.error("Error updating order status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your products, orders, and business</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders to Ship</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest confirmed orders that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">{order.user.email}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No orders yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Create a new product for your store</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                  <Input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
                  <Input name="price" placeholder="Price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
                  <Input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="md:col-span-2" />
                  <Input name="imageUrls" placeholder="Image URLs (comma separated)" value={form.imageUrls} onChange={handleChange} className="md:col-span-2" />
                  <Button type="submit" disabled={loading} className="md:col-span-2">
                    {loading ? "Adding..." : "Add Product"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    {Array.isArray(product.imageUrls) && product.imageUrls.length > 0 ? (
                      <ProductImageCarousel images={product.imageUrls} alt={product.name} />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <p className="text-lg font-bold text-green-600 mb-3">${product.price.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(product)} className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteProduct(product)} className="flex-1">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and manage all confirmed customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Customer: {order.user.name || order.user.email}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Date: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="text-sm">
                                {item.product.name} x {item.quantity} - ${item.price.toFixed(2)}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                          </div>
                          <Select 
                            value={order.status} 
                            onValueChange={(value: string) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                              <SelectItem value="SHIPPED">Shipped</SelectItem>
                              <SelectItem value="DELIVERED">Delivered</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No orders yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Business insights and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Top Products</h3>
                    <div className="space-y-2">
                      {products.slice(0, 5).map((product) => (
                        <div key={product.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{product.name}</span>
                          <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Order Status Distribution</h3>
                    <div className="space-y-2">
                      {['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => {
                        const count = orders.filter(order => order.status === status).length;
                        return (
                          <div key={status} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{status}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!editProduct} onOpenChange={v => !v && setEditProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={handleEditSubmit}>
              <Input name="name" placeholder="Product Name" value={editForm.name} onChange={handleEditChange} required />
              <Input name="description" placeholder="Description" value={editForm.description} onChange={handleEditChange} />
              <Input name="price" placeholder="Price" type="number" step="0.01" value={editForm.price} onChange={handleEditChange} required />
              <Input name="imageUrls" placeholder="Image URLs (comma separated)" value={editForm.imageUrls} onChange={handleEditChange} />
              <DialogFooter>
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                <Button type="button" variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
      </div>
    </div>
  );
} 
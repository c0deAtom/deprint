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
import ImageUpload from "@/components/ImageUpload";
import { Package, ShoppingCart, LogOut, User, Plus, Edit, Trash2, Search, Calendar, X, Link, Upload } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
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
  status: 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: {
    name: string;
    email: string;
    address: {
      line1: string;
      state: string;
      city: string;
      pincode: string;
      mobile: string;
    };
  };
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
  const { user, loading, logout: useAdminAuthLogout, isAuthenticated } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", imageUrls: "" });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageTab, setImageTab] = useState<"upload" | "link">("upload");
  const [loadingData, setLoadingData] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "", category: "", imageUrls: "" });
  const [editUploadedImages, setEditUploadedImages] = useState<string[]>([]);
  const [editImageTab, setEditImageTab] = useState<"upload" | "link">("upload");
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<{
    type: 'all' | 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom';
    startDate: string;
    endDate: string;
  }>({
    type: 'all',
    startDate: "",
    endDate: ""
  });

  // Predefined categories
  const categories = [
    "Toys",
    "Pots", 
    "Keychain",
    "3Dcube",
    "Electronics",
    "Home & Garden",
    "Fashion",
    "Books",
    "Sports",
    "Other"
  ];

  // Redirect if not authenticated
  useEffect(() => {
    console.log("Admin page: loading =", loading, "isAuthenticated =", isAuthenticated);
    if (!loading && !isAuthenticated) {
      console.log("Admin page: Redirecting to login");
      window.location.href = "/admin/login";
    }
  }, [loading, isAuthenticated]);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchStats()
    ]);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [fetchData, isAuthenticated]);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch("/api/products", { headers });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch {
      toast.error("Error fetching products");
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch("/api/admin/orders", { headers });
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
      const token = localStorage.getItem("adminToken");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch("/api/admin/stats", { headers });
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
    setLoadingData(true);
    try {
      const linkUrls = form.imageUrls.split(',').map(url => url.trim()).filter(Boolean);
      const allImageUrls = [...uploadedImages, ...linkUrls];
      
      const token = localStorage.getItem("adminToken");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch("/api/products", {
        method: "POST",
        headers,
        body: JSON.stringify({ ...form, price: parseFloat(form.price), imageUrls: allImageUrls }),
      });
      if (res.ok) {
        toast.success("Product added successfully!");
        setForm({ name: "", description: "", price: "", category: "", imageUrls: "" });
        setUploadedImages([]);
        setImageTab("upload");
        setShowAddDialog(false);
        fetchProducts();
        fetchStats();
      } else {
        toast.error("Failed to add product");
      }
    } catch {
      toast.error("Error adding product");
    }
    setLoadingData(false);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    const productImages = Array.isArray(product.imageUrls) ? product.imageUrls : [];
    
    // Try to determine if images are uploaded (Cloudinary URLs) or links
    const cloudinaryUrls = productImages.filter(url => url.includes('cloudinary.com'));
    const linkUrls = productImages.filter(url => !url.includes('cloudinary.com'));
    
    setEditUploadedImages(cloudinaryUrls);
    setEditForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category || "",
      imageUrls: linkUrls.join(', '),
    });
    setEditImageTab(cloudinaryUrls.length > 0 ? "upload" : "link");
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setLoadingData(true);
    try {
      const linkUrls = editForm.imageUrls.split(',').map(url => url.trim()).filter(Boolean);
      const allImageUrls = [...editUploadedImages, ...linkUrls];
      
      const token = localStorage.getItem("adminToken");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ ...editForm, price: parseFloat(editForm.price), imageUrls: allImageUrls }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map(p => (p.id === updated.id ? updated : p)));
        setEditProduct(null);
        setEditUploadedImages([]);
        setEditImageTab("upload");
        toast.success("Product updated!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update product");
      }
    } catch {
      toast.error("Error updating product");
    }
    setLoadingData(false);
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setLoadingData(true);
    try {
      const token = localStorage.getItem("adminToken");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`/api/products/${deleteProduct.id}`, {
        method: "DELETE",
        headers
      });
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
    setLoadingData(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: status as Order['status'] } : order
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

  // Date filtering logic
  const filteredOrders = orders.filter(order => {
    if (dateFilter.type === 'all') {
      return true; // No date filter applied
    }

    const orderDate = new Date(order.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter.type) {
      case 'today':
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        return orderDate >= today && orderDate <= todayEnd;

      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return orderDate >= yesterday && orderDate <= yesterdayEnd;

      case 'last7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return orderDate >= sevenDaysAgo;

      case 'last30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return orderDate >= thirtyDaysAgo;

      case 'custom':
        if (!dateFilter.startDate && !dateFilter.endDate) {
          return true;
        }
        const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
        const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

        // Set time to end of day for end date to include the entire day
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
        }

        if (startDate && endDate) {
          return orderDate >= startDate && orderDate <= endDate;
        } else if (startDate) {
          return orderDate >= startDate;
        } else if (endDate) {
          return orderDate <= endDate;
        }
        return true;

      default:
        return true;
    }
  });

  const clearDateFilter = () => {
    setDateFilter({
      type: 'all',
      startDate: "",
      endDate: ""
    });
  };

  const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateFilter(prev => ({
      ...prev,
      type: 'custom',
      [field]: value
    }));
  };

  const setDateFilterType = (type: 'all' | 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom') => {
    setDateFilter(prev => ({
      ...prev,
      type
    }));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={useAdminAuthLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {/* Products Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Products Management</h2>
                <p className="text-muted-foreground">
                  {productsLoading 
                    ? "Loading products..." 
                    : `${filteredProducts.length} of ${products.length} products`
                  }
                </p>
              </div>
              <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {/* Search Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-3">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="aspect-square relative mb-4 overflow-hidden rounded-lg">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <ProductImageCarousel images={product.imageUrls} alt={product.name} />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">
                          {product.description || "No description"}
                        </CardDescription>
                        {product.category && (
                          <Badge variant="secondary" className="w-fit text-xs">
                            {product.category}
                          </Badge>
                        )}
                        <div className="text-lg font-bold text-green-600">₹{product.price.toFixed(2)}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(product)}
                          className="flex-1 flex items-center gap-2"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteProduct(product)}
                          className="flex-1 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!productsLoading && filteredProducts.length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {searchTerm ? "No products found" : "No products yet"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm 
                        ? "Try adjusting your search terms" 
                        : "Get started by adding your first product"
                      }
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Your First Product
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            {/* Orders Header with Date Filter */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Orders Management</h2>
                  <p className="text-muted-foreground">
                    {filteredOrders.length} of {orders.length} orders
                    {dateFilter.type !== 'all' && (
                      <span className="ml-2 text-sm text-blue-600">
                        (filtered by date)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Date Filter */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-3 block">Filter Orders by Date</label>
                      
                      {/* Quick Filter Buttons */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button
                          variant={dateFilter.type === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDateFilterType('all')}
                        >
                          All Orders
                        </Button>
                        <Button
                          variant={dateFilter.type === 'today' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDateFilterType('today')}
                        >
                          Today
                        </Button>
                        <Button
                          variant={dateFilter.type === 'yesterday' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDateFilterType('yesterday')}
                        >
                          Yesterday
                        </Button>
                        <Button
                          variant={dateFilter.type === 'last7days' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDateFilterType('last7days')}
                        >
                          Last 7 Days
                        </Button>
                        <Button
                          variant={dateFilter.type === 'last30days' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDateFilterType('last30days')}
                        >
                          Last 30 Days
                        </Button>
                        <Button
                          variant={dateFilter.type === 'custom' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDateFilterType('custom')}
                        >
                          Custom Range
                        </Button>
                      </div>

                      {/* Custom Date Range (only show when custom is selected) */}
                      {dateFilter.type === 'custom' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              type="date"
                              value={dateFilter.startDate}
                              onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                              className="pl-10"
                              placeholder="Start date"
                            />
                          </div>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              type="date"
                              value={dateFilter.endDate}
                              onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                              className="pl-10"
                              placeholder="End date"
                            />
                          </div>
                        </div>
                      )}

                      {/* Active Filter Info */}
                      {dateFilter.type !== 'all' && (
                        <div className="flex items-center justify-between mt-3 p-2 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">
                            {dateFilter.type === 'today' && 'Showing orders from today'}
                            {dateFilter.type === 'yesterday' && 'Showing orders from yesterday'}
                            {dateFilter.type === 'last7days' && 'Showing orders from last 7 days'}
                            {dateFilter.type === 'last30days' && 'Showing orders from last 30 days'}
                            {dateFilter.type === 'custom' && (
                              dateFilter.startDate || dateFilter.endDate 
                                ? `Showing orders from ${dateFilter.startDate || 'beginning'} to ${dateFilter.endDate || 'today'}`
                                : 'Select a date range'
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearDateFilter}
                            className="flex items-center gap-1 text-xs"
                          >
                            <X className="w-3 h-3" />
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <CardDescription>
                          {order.user.name || order.user.email} • {new Date(order.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        <div className="text-lg font-bold">₹{order.total.toFixed(2)}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Shipping Address - Displayed prominently first */}
                      {order.shippingAddress && (
                        <div className="bg-muted/50 p-4 rounded-lg border">
                          <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                            📦 Shipping Address
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(() => {
                              const address = order.shippingAddress;
                              if (typeof address === 'object' && address !== null) {
                                return (
                                  <>
                                    <div className="space-y-2">
                                      {address.name && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-muted-foreground">Name:</span>
                                          <span className="font-medium">{address.name}</span>
                                        </div>
                                      )}
                                      {address.email && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-muted-foreground">Email:</span>
                                          <span>{address.email}</span>
                                        </div>
                                      )}
                                      {address.address?.mobile && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                                          <span>{address.address.mobile}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      {address.address?.line1 && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-muted-foreground">Address:</span>
                                          <span>{address.address.line1}</span>
                                        </div>
                                      )}
                                      {(address.address?.city || address.address?.state) && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-muted-foreground">City/State:</span>
                                          <span>{[address.address.city, address.address.state].filter(Boolean).join(', ')}</span>
                                        </div>
                                      )}
                                      {address.address?.pincode && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-muted-foreground">Pincode:</span>
                                          <span className="font-medium">{address.address.pincode}</span>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                );
                              }
                              return (
                                <div className="col-span-2 text-muted-foreground">
                                  Address information not available
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Order Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Order Status</label>
                          <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                            <SelectTrigger>
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

                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          🛍️ Order Items
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                              <span>{item.product.name} × {item.quantity}</span>
                              <span className="font-medium">₹{item.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State for Orders */}
            {filteredOrders.length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {dateFilter.type !== 'all' ? "No orders found for selected filter" : "No orders yet"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {dateFilter.type !== 'all'
                        ? "Try adjusting your filter or clear the filter to see all orders" 
                        : "Orders will appear here once customers start placing them"
                      }
                    </p>
                    {dateFilter.type !== 'all' && (
                      <Button onClick={clearDateFilter} variant="outline" className="flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Clear Filter
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Store performance and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={handleEditChange}
                  placeholder="₹0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Product Images</label>
              <Tabs value={editImageTab} onValueChange={(value) => setEditImageTab(value as "upload" | "link")} className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Images
                  </TabsTrigger>
                  <TabsTrigger value="link" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Image Links
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-4">
                  <ImageUpload
                    onImagesUploaded={setEditUploadedImages}
                    existingImages={editUploadedImages}
                    maxImages={5}
                  />
                </TabsContent>
                
                <TabsContent value="link" className="mt-4">
                  <div className="space-y-2">
                    <Input
                      name="imageUrls"
                      value={editForm.imageUrls}
                      onChange={handleEditChange}
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter image URLs separated by commas. You can use both upload and links together.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loadingData}>
                {loadingData ? "Updating..." : "Update Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete &quot;{deleteProduct?.name}&quot;? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProduct(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loadingData}>
              {loadingData ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Product name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="₹0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Product description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Product Images</label>
              <Tabs value={imageTab} onValueChange={(value) => setImageTab(value as "upload" | "link")} className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Images
                  </TabsTrigger>
                  <TabsTrigger value="link" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Image Links
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-4">
                  <ImageUpload
                    onImagesUploaded={setUploadedImages}
                    existingImages={uploadedImages}
                    maxImages={5}
                  />
                </TabsContent>
                
                <TabsContent value="link" className="mt-4">
                  <div className="space-y-2">
                    <Input
                      name="imageUrls"
                      value={form.imageUrls}
                      onChange={handleChange}
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter image URLs separated by commas. You can use both upload and links together.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loadingData}>
                {loadingData ? "Adding..." : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Calendar, Eye, ShoppingBag, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      imageUrls: string[];
    };
  }>;
  trackingLink?: string;
  adminMessage?: string;
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/orders");
      return;
    }

    if (status === "authenticated") {
      const fetchOrders = async () => {
        try {
          const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: "10",
            ...(statusFilter !== "ALL" && { status: statusFilter }),
          });

          const res = await fetch(`/api/orders?${params}`);
          if (res.ok) {
            const data: OrdersResponse = await res.json();
            setOrders(data.orders);
            setPagination(data.pagination);
          } else {
            console.error("Failed to fetch orders");
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [status, router, currentPage, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'CONFIRMED': return '✅';
      case 'SHIPPED': return '📦';
      case 'DELIVERED': return '🎉';
      case 'CANCELLED': return '❌';
      default: return '📋';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Your order is being processed';
      case 'CONFIRMED': return 'Your order has been confirmed';
      case 'SHIPPED': return 'Your order is on its way';
      case 'DELIVERED': return 'Your order has been delivered';
      case 'CANCELLED': return 'Your order has been cancelled';
      default: return 'Order status unknown';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  if (status === "loading" || loading) {
    return (
      <main className="flex flex-col items-center px-4 min-h-screen py-10">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-20 rounded" />
                      <Skeleton className="h-6 w-16 rounded" />
                      <div className="text-right">
                        <Skeleton className="h-6 w-16 mb-1" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Skeleton className="w-12 h-12 rounded" />
                          <div className="flex-1 min-w-0">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <main className="flex flex-col items-center px-4 min-h-screen py-10">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track your order history and status</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by status:</span>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Orders</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {pagination.total} order{pagination.total !== 1 ? 's' : ''} total
          </div>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {statusFilter === "ALL" ? "No completed orders yet" : `No ${statusFilter.toLowerCase()} orders`}
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {statusFilter === "ALL" 
                  ? "Complete a purchase to see your orders here. Items in your cart are not considered orders until checkout."
                  : `You don't have any ${statusFilter.toLowerCase()} orders`
                }
              </p>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map((order) => {
                const isPaid = order.status === 'DELIVERED' || order.paymentStatus === 'PAID';
                return (
                  <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow relative">
                    {/* Status badge in top right */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className={`${getStatusColor(order.status)} mr-2`}>
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {order.status}
                      </Badge>
                    </div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getStatusDescription(order.status)}
                          </p>
                          {order.trackingLink && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-2 my-1">
                              <span className="font-medium text-blue-800">Track: </span>
                              <a href={order.trackingLink} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">{order.trackingLink}</a>
                            </div>
                          )}
                          {order.adminMessage && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 my-1">
                              <span className="font-medium text-yellow-800">Note: </span>
                              <span className="text-yellow-900">{order.adminMessage}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 pl-20">
                          <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'destructive'}>
                            {order.paymentStatus}
                          </Badge>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-lg font-bold">
                              ₹{order.total.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {order.items.slice(0, 3).map((item) => {
                            const productContent = (
                              <>
                                {Array.isArray(item.product.imageUrls) && item.product.imageUrls.length > 0 && (
                                  <Image
                                    src={item.product.imageUrls[0]}
                                    alt={item.product.name}
                                    width={50}
                                    height={50}
                                    className="object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                  </p>
                                </div>
                              </>
                            );
                            return isPaid ? (
                              <Link
                                key={item.id}
                                href={`/products/${item.product.id}`}
                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                                title={item.product.name}
                              >
                                {productContent}
                              </Link>
                            ) : (
                              <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg opacity-60 cursor-not-allowed" title={item.product.name}>
                                {productContent}
                              </div>
                            );
                          })}
                          {order.items.length > 3 && (
                            <div className="flex items-center justify-center p-3 border rounded-lg bg-muted/50">
                              <p className="text-sm text-muted-foreground">
                                +{order.items.length - 3} more items
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end pt-4 border-t">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/orders/${order.id}`} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/products">
              <Package className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
} 
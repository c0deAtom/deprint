import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, CheckCircle, Clock, Phone, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: true } },
    },
  });

  if (!order) return notFound();

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
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />;
      case 'SHIPPED': return <Truck className="h-4 w-4" />;
      case 'DELIVERED': return <Package className="h-4 w-4" />;
      case 'CANCELLED': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Your order is being processed and will be confirmed soon.';
      case 'CONFIRMED': return 'Your order has been confirmed and is being prepared for shipment.';
      case 'SHIPPED': return 'Your order is on its way! You will receive tracking information soon.';
      case 'DELIVERED': return 'Your order has been successfully delivered. Enjoy your purchase!';
      case 'CANCELLED': return 'Your order has been cancelled. Please contact support if you have questions.';
      default: return 'Order status is being updated.';
    }
  };

  const getEstimatedDelivery = () => {
    const orderDate = new Date(order.createdAt);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + 7); // 7 days from order date
    return estimatedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="flex flex-col items-center py-12 px-4 min-h-screen">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.id.slice(-8)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getStatusDescription(order.status)}
                </p>
                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
                    <p className="text-sm text-blue-700">{getEstimatedDelivery()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        {Array.isArray(item.product.imageUrls) && item.product.imageUrls.length > 0 && (
                          <Image
                            src={item.product.imageUrls[0] as string}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Price: ₹{item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {index < order.items.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.user.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.user.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/orders">
                    <Package className="h-4 w-4 mr-2" />
                    View All Orders
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/contact">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Support Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  If you have any questions about your order, our support team is here to help.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>support@example.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>1-800-123-4567</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-8">
          <Button asChild>
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
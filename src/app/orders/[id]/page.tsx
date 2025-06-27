import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <main className="flex flex-col items-center py-12 px-4 min-h-screen">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Confirmation</h1>
          <p className="text-muted-foreground">Thank you for your purchase!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Order #{order.id.slice(-8)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Order Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {order.user.name || "N/A"}
              </div>
              <div>
                <span className="font-medium">Email:</span> {order.user.email}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
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
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Order Confirmed</h4>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve received your order and are preparing it for shipment.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Shipping</h4>
                  <p className="text-sm text-muted-foreground">
                    Your order will be shipped within 1-2 business days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ll receive tracking information once your order ships.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
} 
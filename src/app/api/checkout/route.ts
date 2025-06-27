import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  await req.json(); // Just consume the request body, we don't need shippingInfo for now

  try {
    // Find all pending orders for this user
    const pendingOrders = await prisma.order.findMany({
      where: { userId, status: "PENDING" },
      include: { items: { include: { product: true } } },
    });

    if (pendingOrders.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Calculate total for all orders
    let totalAmount = 0;
    for (const order of pendingOrders) {
      const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      totalAmount += orderTotal;
    }

    // Add shipping and tax
    const shipping = 5.99;
    const tax = totalAmount * 0.08;
    const grandTotal = totalAmount + shipping + tax;

    // Create a new confirmed order with all items
    const confirmedOrder = await prisma.order.create({
      data: {
        userId,
        status: "CONFIRMED",
        total: grandTotal,
        items: {
          create: pendingOrders.flatMap(order =>
            order.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            }))
          ),
        },
        // Store shipping info in a JSON field (you might want to add this to your schema)
        // For now, we'll just create the order
      },
      include: {
        items: { include: { product: true } },
        user: { select: { email: true, name: true } },
      },
    });

    // Delete all pending orders
    await prisma.order.deleteMany({
      where: { userId, status: "PENDING" },
    });

    return NextResponse.json(confirmedOrder);
  } catch (error) {
    console.error("Error during checkout:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
} 
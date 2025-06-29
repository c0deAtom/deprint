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
  const body = await req.json();
  const shippingInfo = body.shippingInfo;
  const items = body.items;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items in cart" }, { status: 400 });
  }

  try {
    // Calculate total
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.price * item.quantity;
    }
    const shipping = 80;
    const grandTotal = totalAmount + shipping;

    // Create the order
    const confirmedOrder = await prisma.order.create({
      data: {
        userId,
        status: "CONFIRMED",
        total: grandTotal,
        shippingAddress: shippingInfo,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        user: { select: { email: true, name: true } },
      },
    });

    return NextResponse.json(confirmedOrder);
  } catch (error) {
    console.error("Error during checkout:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
} 
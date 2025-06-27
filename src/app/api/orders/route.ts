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
  const { items } = await req.json();

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }

  try {
    // Calculate total
    const total = items.reduce((sum: number, item: { price: number; quantity: number }) => 
      sum + (item.price * item.quantity), 0
    );

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        status: "CONFIRMED",
        total,
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number }) => ({
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

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
} 
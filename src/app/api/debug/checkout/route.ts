import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Request body:", body);
    
    const shippingInfo = body.shippingInfo;
    const items = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log("Database connected successfully");
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Test order creation with minimal data
    const testOrder = await prisma.order.create({
      data: {
        id: "TEST123",
        userId: session.user.id,
        status: "PENDING",
        total: 100,
        shippingAddress: shippingInfo,
        items: {
          create: items.slice(0, 1).map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    console.log("Test order created:", testOrder);

    // Clean up test order
    await prisma.order.delete({
      where: { id: "TEST123" }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Checkout test successful",
      session: session.user.id,
      itemsCount: items.length
    });
  } catch (error) {
    console.error("Debug checkout error:", error);
    return NextResponse.json({ 
      error: "Debug checkout failed", 
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 
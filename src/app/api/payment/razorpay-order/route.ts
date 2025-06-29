import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Razorpay from "razorpay";

// Check if Razorpay credentials are configured
const isRazorpayConfigured = () => {
  return process.env.RAZORPAY_KEY_ID && 
         process.env.RAZORPAY_KEY_SECRET && 
         process.env.RAZORPAY_KEY_ID !== "rzp_test_your_test_key_id_here" &&
         process.env.RAZORPAY_KEY_SECRET !== "your_test_key_secret_here";
};

// Initialize Razorpay only if credentials are configured
const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.");
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      return NextResponse.json({ 
        error: "Payment gateway not configured. Please contact administrator." 
      }, { status: 503 });
    }

    // Fetch order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        user: { select: { email: true, name: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create Razorpay order
    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // Convert to paise
      currency: "INR",
      receipt: orderId,
      notes: {
        orderId: orderId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
} 
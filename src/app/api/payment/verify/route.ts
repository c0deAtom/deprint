import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Check if Razorpay credentials are configured
const isRazorpayConfigured = () => {
  return process.env.RAZORPAY_KEY_ID && 
         process.env.RAZORPAY_KEY_SECRET && 
         process.env.RAZORPAY_KEY_ID !== "rzp_test_your_test_key_id_here" &&
         process.env.RAZORPAY_KEY_SECRET !== "your_test_key_secret_here";
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }

  try {
    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      return NextResponse.json({ 
        error: "Payment gateway not configured. Please contact administrator." 
      }, { status: 503 });
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Find the order by Razorpay order ID
    const order = await prisma.order.findFirst({
      where: {
        id: {
          contains: razorpay_order_id.split("_").pop() || "",
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status to PAID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentId: razorpay_payment_id,
        paymentStatus: "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      orderId: order.id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
} 
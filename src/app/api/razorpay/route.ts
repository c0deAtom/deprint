import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const orderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().optional().default("INR"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency } = orderSchema.parse(body);

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
} 
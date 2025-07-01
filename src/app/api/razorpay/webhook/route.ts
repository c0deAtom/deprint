import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Make sure to add RESEND_API_KEY to your .env.local
// and replace 'your@email.com' with your email address below.
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Only act on payment.captured event (Razorpay standard for successful payment)
  if (body.event === "payment.captured") {
    const payment = body.payload.payment.entity;

    // Send yourself an email
    await resend.emails.send({
      from: "Your Store <noreply@yourdomain.com>",
      to: "ehmanish@gmail.com", // <-- CHANGE THIS
      subject: "New Order Received",
      html: `
        <h2>New Order Placed</h2>
        <p><b>Order ID:</b> ${payment.order_id}</p>
        <p><b>Amount:</b> ₹${payment.amount / 100}</p>
        <p><b>Customer Email:</b> ${payment.email || "N/A"}</p>
        <p>Check your admin dashboard for more details.</p>
      `,
    });
  }

  return NextResponse.json({ received: true });
} 
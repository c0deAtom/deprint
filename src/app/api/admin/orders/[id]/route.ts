import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status, trackingLink, adminMessage } = await request.json();
    const { id } = await params;
    
    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (trackingLink !== undefined) updateData.trackingLink = trackingLink;
    if (adminMessage !== undefined) updateData.adminMessage = adminMessage;
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
} 
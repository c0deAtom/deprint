import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Cart POST - Session:", session?.user?.id);
    
    if (!session?.user?.id) {
      console.log("Cart POST - Not authenticated");
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await req.json();
    const { productId } = body;
    
    console.log("Cart POST - ProductId:", productId, "UserId:", userId);
    
    if (!productId) {
      console.log("Cart POST - Missing productId");
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    // Find or create a PENDING order for this user
    let order = await prisma.order.findFirst({
      where: { userId, status: 'PENDING' },
      include: { items: true },
    });
    
    console.log("Cart POST - Existing order:", order?.id);
    
    if (!order) {
      order = await prisma.order.create({
        data: { userId, status: 'PENDING', total: 0 },
        include: { items: true },
      });
      console.log("Cart POST - Created new order:", order.id);
    }

    // Check if item already in cart
    const item = order.items.find((i: { productId: string }) => i.productId === productId);
    if (item) {
      console.log("Cart POST - Incrementing existing item:", item.id);
      // Increment quantity
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { quantity: { increment: 1 } },
      });
    } else {
      console.log("Cart POST - Adding new item");
      // Add new item
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        console.log("Cart POST - Product not found:", productId);
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: 1,
          price: product.price,
        },
      });
      console.log("Cart POST - Added new item to order");
    }

    // Optionally, update order total
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true } } },
    });

    console.log("Cart POST - Success, returning updated order");
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Cart POST - Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Cart GET - Session:", session?.user?.id);
    
    if (!session?.user?.id) {
      console.log("Cart GET - Not authenticated");
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const allPending = searchParams.get('allPending');
    
    console.log("Cart GET - UserId:", userId, "AllPending:", allPending);
    
    if (allPending) {
      const orders = await prisma.order.findMany({
        where: { userId, status: 'PENDING' },
        include: { items: { include: { product: true } } },
      });
      console.log("Cart GET - Found orders:", orders.length);
      return NextResponse.json(orders);
    } else {
      const order = await prisma.order.findFirst({
        where: { userId, status: 'PENDING' },
        include: { items: { include: { product: true } } },
      });
      console.log("Cart GET - Found order:", order?.id, "Items:", order?.items?.length || 0);
      return NextResponse.json(order || { items: [] });
    }
  } catch (error) {
    console.error("Cart GET - Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Cart DELETE - Session:", session?.user?.id);
    
    if (!session?.user?.id) {
      console.log("Cart DELETE - Not authenticated");
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    console.log("Cart DELETE - ProductId:", productId, "UserId:", userId);
    
    if (!productId) {
      console.log("Cart DELETE - Missing productId");
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }
    
    // Find pending order
    const order = await prisma.order.findFirst({
      where: { userId, status: 'PENDING' },
      include: { items: true },
    });
    
    if (!order) {
      console.log("Cart DELETE - No cart found");
      return NextResponse.json({ error: 'No cart found' }, { status: 404 });
    }
    
    // Find item
    const item = order.items.find((i: { productId: string }) => i.productId === productId);
    if (!item) {
      console.log("Cart DELETE - Item not found in cart");
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }
    
    await prisma.orderItem.delete({ where: { id: item.id } });
    console.log("Cart DELETE - Deleted item:", item.id);
    
    // Optionally, update order total
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true } } },
    });
    
    console.log("Cart DELETE - Success, returning updated order");
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Cart DELETE - Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const userId = session.user.id;
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }

  // Find or create a PENDING order for this user
  let order = await prisma.order.findFirst({
    where: { userId, status: 'PENDING' },
    include: { items: true },
  });
  if (!order) {
    order = await prisma.order.create({
      data: { userId, status: 'PENDING', total: 0 },
      include: { items: true },
    });
  }

  // Check if item already in cart
  const item = order.items.find((i: { productId: string }) => i.productId === productId);
  if (item) {
    // Increment quantity
    await prisma.orderItem.update({
      where: { id: item.id },
      data: { quantity: { increment: 1 } },
    });
  } else {
    // Add new item
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
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
  }

  // Optionally, update order total
  const updatedOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json(updatedOrder);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const allPending = searchParams.get('allPending');
  if (allPending) {
    const orders = await prisma.order.findMany({
      where: { userId, status: 'PENDING' },
      include: { items: { include: { product: true } } },
    });
    return NextResponse.json(orders);
  } else {
    const order = await prisma.order.findFirst({
      where: { userId, status: 'PENDING' },
      include: { items: { include: { product: true } } },
    });
    return NextResponse.json(order || { items: [] });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }
  // Find pending order
  const order = await prisma.order.findFirst({
    where: { userId, status: 'PENDING' },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: 'No cart found' }, { status: 404 });
  }
  // Find item
  const item = order.items.find((i: { productId: string }) => i.productId === productId);
  if (!item) {
    return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
  }
  await prisma.orderItem.delete({ where: { id: item.id } });
  // Optionally, update order total
  const updatedOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(updatedOrder);
} 
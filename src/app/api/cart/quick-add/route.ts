import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await req.json();
    const { productId } = body;
    
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    // Use a transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Find or create a PENDING order for this user
      let order = await tx.order.findFirst({
        where: { userId, status: 'PENDING' },
        include: { items: true },
      });
      
      if (!order) {
        order = await tx.order.create({
          data: { userId, status: 'PENDING', total: 0 },
          include: { items: true },
        });
      }

      // Check if item already in cart
      const existingItem = order.items.find((i: { productId: string }) => i.productId === productId);
      
      if (existingItem) {
        // Increment quantity
        await tx.orderItem.update({
          where: { id: existingItem.id },
          data: { quantity: { increment: 1 } },
        });
      } else {
        // Add new item - get product info in the same transaction
        const product = await tx.product.findUnique({ 
          where: { id: productId },
          select: { id: true, price: true }
        });
        
        if (!product) {
          throw new Error('Product not found');
        }
        
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        });
      }

      // Get updated cart status
      const updatedOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      const totalItems = updatedOrder?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const totalPrice = updatedOrder?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

      return {
        success: true,
        added: !existingItem,
        incremented: !!existingItem,
        totalItems,
        totalPrice,
        productInCart: true
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Quick add to cart - Error:", error);
    
    if (error instanceof Error && error.message === 'Product not found') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
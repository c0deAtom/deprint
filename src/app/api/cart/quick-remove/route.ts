import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  try {
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
    
    // Use a transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Find pending order
      const order = await tx.order.findFirst({
        where: { userId, status: 'PENDING' },
        include: { items: true },
      });
      
      if (!order) {
        throw new Error('No cart found');
      }
      
      // Find item
      const item = order.items.find((i: { productId: string }) => i.productId === productId);
      if (!item) {
        throw new Error('Item not found in cart');
      }
      
      // Delete the item
      await tx.orderItem.delete({ where: { id: item.id } });
      
      // Get updated cart status
      const updatedOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });
      
      const totalItems = updatedOrder?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const totalPrice = updatedOrder?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
      
      return {
        success: true,
        removed: true,
        totalItems,
        totalPrice,
        productInCart: false
      };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Quick remove from cart - Error:", error);
    
    if (error instanceof Error) {
      if (error.message === 'No cart found') {
        return NextResponse.json({ error: 'No cart found' }, { status: 404 });
      }
      if (error.message === 'Item not found in cart') {
        return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
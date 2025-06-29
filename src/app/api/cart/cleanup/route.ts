import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;

    // Use a transaction to consolidate orders
    const result = await prisma.$transaction(async (tx) => {
      // Find all pending orders for this user
      const pendingOrders = await tx.order.findMany({
        where: { userId, status: 'PENDING' },
        include: { items: true },
        orderBy: { createdAt: 'asc' }
      });

      if (pendingOrders.length <= 1) {
        return { message: 'No consolidation needed', consolidated: 0 };
      }

      // Use the first order as the main order
      const mainOrder = pendingOrders[0];
      const ordersToDelete = pendingOrders.slice(1);

      // Move all items from other orders to the main order
      for (const order of ordersToDelete) {
        for (const item of order.items) {
          // Check if item already exists in main order
          const existingItem = mainOrder.items.find(i => i.productId === item.productId);
          
          if (existingItem) {
            // Update quantity
            await tx.orderItem.update({
              where: { id: existingItem.id },
              data: { quantity: { increment: item.quantity } }
            });
          } else {
            // Create new item in main order
            await tx.orderItem.create({
              data: {
                orderId: mainOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }
            });
          }
        }
      }

      // Delete the extra orders
      const orderIdsToDelete = ordersToDelete.map(o => o.id);
      await tx.order.deleteMany({
        where: { id: { in: orderIdsToDelete } }
      });

      return { 
        message: 'Orders consolidated successfully', 
        consolidated: ordersToDelete.length 
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cart cleanup - Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
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
    const { operations } = body; // Array of { action: 'add'|'remove', productId: string }
    
    if (!Array.isArray(operations) || operations.length === 0) {
      return NextResponse.json({ error: 'Invalid operations' }, { status: 400 });
    }

    // Use a transaction for all operations
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

      const results = [];
      
      for (const operation of operations) {
        const { action, productId } = operation;
        
        if (action === 'add') {
          // Check if item already in cart
          const existingItem = order.items.find((i: { productId: string }) => i.productId === productId);
          
          if (existingItem) {
            // Increment quantity
            await tx.orderItem.update({
              where: { id: existingItem.id },
              data: { quantity: { increment: 1 } },
            });
            results.push({ action: 'incremented', productId });
          } else {
            // Add new item - get product info
            const product = await tx.product.findUnique({ 
              where: { id: productId },
              select: { id: true, price: true }
            });
            
            if (!product) {
              results.push({ action: 'error', productId, error: 'Product not found' });
              continue;
            }
            
            await tx.orderItem.create({
              data: {
                orderId: order.id,
                productId: product.id,
                quantity: 1,
                price: product.price,
              },
            });
            results.push({ action: 'added', productId });
          }
        } else if (action === 'remove') {
          // Find item
          const item = order.items.find((i: { productId: string }) => i.productId === productId);
          if (item) {
            await tx.orderItem.delete({ where: { id: item.id } });
            results.push({ action: 'removed', productId });
          } else {
            results.push({ action: 'error', productId, error: 'Item not found in cart' });
          }
        }
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
        results,
        totalItems,
        totalPrice
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Batch cart operations - Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const productIdsParam = searchParams.get('productIds');
    
    if (!productIdsParam) {
      return NextResponse.json({ error: 'Missing productIds' }, { status: 400 });
    }
    
    const productIds = productIdsParam.split(',').filter(Boolean);
    
    if (productIds.length === 0) {
      return NextResponse.json({ error: 'No valid product IDs provided' }, { status: 400 });
    }
    
    // Use a transaction for all operations
    const result = await prisma.$transaction(async (tx) => {
      // Find pending order
      const order = await tx.order.findFirst({
        where: { userId, status: 'PENDING' },
        include: { items: true },
      });
      
      if (!order) {
        throw new Error('No cart found');
      }
      
      // Find items to delete
      const itemsToDelete = order.items.filter((item: { productId: string }) => 
        productIds.includes(item.productId)
      );
      
      if (itemsToDelete.length === 0) {
        throw new Error('No items found in cart');
      }
      
      // Delete all items in parallel
      await Promise.all(
        itemsToDelete.map(item => 
          tx.orderItem.delete({ where: { id: item.id } })
        )
      );
      
      // Return updated order
      const updatedOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { 
          items: { 
            include: { 
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrls: true
                }
              } 
            } 
          } 
        },
      });
      
      return {
        order: updatedOrder,
        deleted: itemsToDelete.length
      };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cart batch DELETE - Error:", error);
    
    if (error instanceof Error) {
      if (error.message === 'No cart found') {
        return NextResponse.json({ error: 'No cart found' }, { status: 404 });
      }
      if (error.message === 'No items found in cart') {
        return NextResponse.json({ error: 'No items found in cart' }, { status: 404 });
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
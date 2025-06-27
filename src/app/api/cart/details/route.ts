import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get all pending orders with complete product details
    const orders = await prisma.order.findMany({
      where: { userId, status: 'PENDING' },
      include: { 
        items: { 
          include: { 
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrls: true
              }
            } 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to a cleaner format
    const cartItems = orders.flatMap(order => 
      order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          imageUrls: item.product.imageUrls
        }
      }))
    );

    // Calculate totals
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      items: cartItems,
      totalItems,
      totalPrice,
      orderCount: orders.length
    });
  } catch (error) {
    console.error("Cart details GET - Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
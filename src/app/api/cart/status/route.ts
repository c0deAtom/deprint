import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        items: [],
        totalItems: 0,
        totalPrice: 0,
        productIds: [],
        isAuthenticated: false
      });
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const checkProductId = searchParams.get('productId');
    
    // Get cart status efficiently
    const orders = await prisma.order.findMany({
      where: { userId, status: 'PENDING' },
      include: { 
        items: {
          select: {
            productId: true,
            quantity: true,
            price: true
          }
        } 
      }
    });

    const cartItems = orders.flatMap(order => order.items);
    const productIds = cartItems.map(item => item.productId);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check if specific product is in cart
    let isProductInCart = false;
    let productQuantity = 0;
    if (checkProductId) {
      const productItem = cartItems.find(item => item.productId === checkProductId);
      isProductInCart = !!productItem;
      productQuantity = productItem?.quantity || 0;
    }

    return NextResponse.json({
      items: cartItems,
      totalItems,
      totalPrice,
      productIds,
      isAuthenticated: true,
      isProductInCart,
      productQuantity,
      orderCount: orders.length
    });
  } catch (error) {
    console.error("Cart status GET - Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
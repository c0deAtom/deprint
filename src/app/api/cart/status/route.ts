import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Cart status GET - Session:", session?.user?.id);
    
    if (!session?.user?.id) {
      console.log("Cart status GET - Not authenticated");
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
    
    console.log("Cart status GET - UserId:", userId, "CheckProductId:", checkProductId);
    
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

    console.log("Cart status GET - Orders found:", orders.length);
    console.log("Cart status GET - Order details:", orders);

    const cartItems = orders.flatMap(order => order.items);
    const productIds = cartItems.map(item => item.productId);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    console.log("Cart status GET - Cart items:", cartItems);
    console.log("Cart status GET - Product IDs:", productIds);
    console.log("Cart status GET - Total items:", totalItems);
    console.log("Cart status GET - Total price:", totalPrice);

    // Check if specific product is in cart
    let isProductInCart = false;
    let productQuantity = 0;
    if (checkProductId) {
      const productItem = cartItems.find(item => item.productId === checkProductId);
      isProductInCart = !!productItem;
      productQuantity = productItem?.quantity || 0;
      console.log("Cart status GET - Product check:", { checkProductId, isProductInCart, productQuantity });
    }

    const response = {
      items: cartItems,
      totalItems,
      totalPrice,
      productIds,
      isAuthenticated: true,
      isProductInCart,
      productQuantity,
      orderCount: orders.length
    };

    console.log("Cart status GET - Response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Cart status GET - Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
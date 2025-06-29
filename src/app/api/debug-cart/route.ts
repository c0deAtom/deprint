import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Debug Cart - Session:", session);
    console.log("Debug Cart - User ID:", session?.user?.id);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        session: session,
        hasUser: !!session?.user,
        hasUserId: !!session?.user?.id
      });
    }
    
    const userId = session.user.id;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });
    
    console.log("Debug Cart - User from DB:", user);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found in database',
        sessionUserId: userId
      });
    }
    
    // Check for pending orders
    const orders = await prisma.order.findMany({
      where: { userId, status: 'PENDING' },
      include: { 
        items: { 
          include: { 
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            } 
          } 
        } 
      }
    });
    
    console.log("Debug Cart - Orders found:", orders.length);
    console.log("Debug Cart - Order details:", orders);
    
    // Check all products
    const products = await prisma.product.findMany({
      select: { id: true, name: true, price: true }
    });
    
    console.log("Debug Cart - Products found:", products.length);
    
    return NextResponse.json({
      authenticated: true,
      userId: userId,
      user: user,
      orders: orders,
      orderCount: orders.length,
      products: products,
      productCount: products.length
    });
    
  } catch (error) {
    console.error("Debug Cart - Error:", error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
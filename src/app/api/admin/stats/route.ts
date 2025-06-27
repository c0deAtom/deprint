import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [totalProducts, totalOrders, totalRevenue, pendingOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count({
        where: {
          status: {
            in: ['CONFIRMED', 'SHIPPED', 'DELIVERED']
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          status: {
            in: ['CONFIRMED', 'SHIPPED', 'DELIVERED']
          }
        },
        _sum: {
          total: true,
        },
      }),
      prisma.order.count({
        where: {
          status: "CONFIRMED",
        },
      }),
    ]);

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
} 
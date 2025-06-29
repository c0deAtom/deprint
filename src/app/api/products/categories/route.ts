import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categoryCounts = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      where: {
        category: {
          not: null,
        },
      },
    });

    const formattedCounts = categoryCounts.map(item => ({
      category: item.category || 'Other',
      count: item._count.category,
    }));

    return NextResponse.json(formattedCounts);
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return NextResponse.json({ error: 'Failed to fetch category counts' }, { status: 500 });
  }
} 
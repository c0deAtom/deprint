import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await context.params;
    const ratings = await prisma.rating.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const avg = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length) : null;
    return NextResponse.json({ ratings, average: avg });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await context.params;
    const { userId, value } = await req.json();
    if (!userId || !value) {
      return NextResponse.json({ error: 'userId and value are required.' }, { status: 400 });
    }
    const ratingValue = Math.max(1, Math.min(5, parseInt(value)));
    // Upsert: one rating per user per product
    const rating = await prisma.rating.upsert({
      where: { userId_productId: { userId, productId } },
      update: { value: ratingValue },
      create: { userId, productId, value: ratingValue },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(rating);
  } catch {
    return NextResponse.json({ error: 'Failed to add rating' }, { status: 500 });
  }
} 
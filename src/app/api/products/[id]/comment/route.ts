import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await context.params;
    const comments = await prisma.comment.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await context.params;
    const { userId, text, rating } = await req.json();
    if (!userId || !text) {
      return NextResponse.json({ error: 'userId and text are required.' }, { status: 400 });
    }
    try {
      const comment = await prisma.comment.create({
        data: {
          productId,
          userId,
          text,
          rating: rating ? Math.max(1, Math.min(5, parseInt(rating))) : undefined,
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      return NextResponse.json(comment);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'P2003') {
        return NextResponse.json({ error: 'Invalid userId: user does not exist.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to add comment', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
} 
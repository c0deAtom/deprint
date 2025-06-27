import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = await req.json();
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        imageUrl: data.imageUrl || null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const deleted = await prisma.product.delete({ where: { id } });
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
} 
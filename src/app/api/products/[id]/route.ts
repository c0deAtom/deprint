import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();
    const data = await req.json();
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        category: data.category || null,
        imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls as string[] : [],
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Check if product exists first
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete the product (order items will be cascaded due to schema update)
    const deleted = await prisma.product.delete({ 
      where: { id },
      include: {
        orderItems: true
      }
    });
    
    return NextResponse.json({ 
      message: 'Product deleted successfully',
      deletedProduct: deleted 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
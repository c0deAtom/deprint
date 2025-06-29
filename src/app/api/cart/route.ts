import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    }

    // Transform cart items to match the expected format
    const cartItems = cart.items.map((item: { id: string; productId: string; quantity: number; product: { name: string; price: number; imageUrls: unknown } }) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      imageUrls: item.product.imageUrls,
      quantity: item.quantity
    }));

    return NextResponse.json({ items: cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST - Add item(s) to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    // Batch merge: if array, merge all
    if (Array.isArray(body)) {
      // body: [{ productId, quantity }]
      // Get or create user's cart
      let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId: session.user.id } });
      }
      for (const item of body) {
        if (!item.productId) continue;
        const existingItem = await prisma.cartItem.findUnique({
          where: { cartId_productId: { cartId: cart.id, productId: item.productId } }
        });
        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + (item.quantity || 1) }
          });
        } else {
          await prisma.cartItem.create({
            data: { cartId: cart.id, productId: item.productId, quantity: item.quantity || 1 }
          });
        }
      }
      return NextResponse.json({ success: true });
    }
    // Single item (original logic)
    const { productId, quantity = 1 } = body;
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: session.user.id } });
    }
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: productId } }
    });
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: productId, quantity: quantity }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItemId, quantity } = await request.json();

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ error: "Cart item ID and quantity are required" }, { status: 400 });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      });
    } else {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('cartItemId');

    if (!cartItemId) {
      return NextResponse.json({ error: "Cart item ID is required" }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 });
  }
} 
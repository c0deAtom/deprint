import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { quantity } = await request.json()

    if (!quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: user.id,
      },
    })

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      )
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: params.itemId,
        cartId: cart.id,
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: {
          id: item.id,
        },
      })
    } else {
      await prisma.cartItem.update({
        where: {
          id: item.id,
        },
        data: {
          quantity,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: user.id,
      },
    })

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      )
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: params.itemId,
        cartId: cart.id,
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    await prisma.cartItem.delete({
      where: {
        id: item.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting cart item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function POST() {
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

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 
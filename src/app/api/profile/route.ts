import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log("=== PROFILE API GET REQUEST ===");
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    const session = await getServerSession(authOptions);
    
    console.log("GET - Full session object:", JSON.stringify(session, null, 2));
    console.log("GET - Session user:", session?.user);
    console.log("GET - Session user ID:", session?.user?.id);
    console.log("GET - Session exists:", !!session);
    
    if (!session) {
      console.log("No session found at all");
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }
    
    if (!session.user) {
      console.log("Session exists but no user object");
      return NextResponse.json({ error: "No user in session" }, { status: 401 });
    }
    
    if (!session.user.id) {
      console.log("Session and user exist but no user ID");
      return NextResponse.json({ error: "No user ID in session" }, { status: 401 });
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
      }
    });

    if (!user) {
      console.log("User not found in database with ID:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found in database:", user);
    return NextResponse.json({ user });

  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Session in profile API:", session);
    console.log("Session user ID:", session?.user?.id);
    
    if (!session?.user?.id) {
      console.log("No session or user ID found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, email, address } = await req.json();
    console.log("Received data:", { name, email, address });

    // Validate input
    if (!name || !email) {
      console.log("Missing required fields");
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Optionally validate address fields here
    // address: { line1, state, city, pincode, mobile }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        id: { not: session.user.id }
      }
    });

    if (existingUser) {
      console.log("Email already in use by another user");
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    console.log("Updating user with ID:", session.user.id);

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        address: address || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
      }
    });

    console.log("Updated user:", updatedUser);

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
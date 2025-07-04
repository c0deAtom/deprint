import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email, 
        role: "admin",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      JWT_SECRET
    );

    // Create response with token in body for client-side storage
    const response = NextResponse.json({
      message: "Login successful",
      token,
      user: { 
        id: admin.id,
        email: admin.email, 
        name: admin.name,
        role: "admin" 
      }
    });

    // Also set as HTTP-only cookie for middleware
    response.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;

  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 
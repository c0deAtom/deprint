import { NextResponse } from "next/server";

export function middleware() {
  // Completely disabled for testing
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
}; 
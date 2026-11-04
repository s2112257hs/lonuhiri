import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow public API routes (e.g., /api/home, /api/rooms, etc.)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next(); // Allow public access without any token check
  }

  // Redirect logged-in users from auth pages to admin
  if (pathname.startsWith("/auth") && token && !token.invalid) {
    return NextResponse.redirect(new URL(token.role === "admin" ? "/admin" : "/", req.url));
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token || token.invalid) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Allow public routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};

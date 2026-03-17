import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_ACCESS_SECRET,
  });

  // Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.user?.role;

  // Admin routes
  if (pathname.startsWith("/admin/dashboard") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Customer routes
  if (pathname.startsWith("/account") && role !== "customer") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token"); // Example: Using token for authentication check

  const loggedIn = !!token; // Check if the user is logged in

  const { pathname } = req.nextUrl;

  // Redirect logged-out users trying to access protected routes
  if (!loggedIn && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect logged-in users trying to access public routes
  if (loggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Apply middleware only for specific routes
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};

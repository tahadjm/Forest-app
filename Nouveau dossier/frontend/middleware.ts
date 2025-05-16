import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check for token in cookies (primary) or authorization header (fallback)
  const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  // Define protected routes that require authentication
  const protectedRoutes = ["/profile", "/reservation", "/dashboard"]

  // Define admin-only routes
  const adminRoutes = ["/dashboard"]

  // Define manager (sous admin) routes - they can access dashboard but with limited permissions
  const managerRoutes = ["/dashboard"]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Check if the current path is an admin-only route
  const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // If trying to access protected routes without being logged in
  if (isProtectedRoute && !token) {
    // Redirect to home page with auth modal trigger
    const url = new URL(`/`, request.url)
    url.searchParams.set("auth", "login")
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // For admin routes, we'll let the client-side component handle the role check
  // This is because we can't easily decode and verify the JWT token in middleware
  // The ProtectedRoute component will handle this check

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/profile/:path*", "/reservation/:path*", "/dashboard/:path*"],
}

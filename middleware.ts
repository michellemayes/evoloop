import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Stack Auth handles auth routes via /handler/[...stack]
  // Page-level protection is recommended over middleware for Stack Auth
  // This middleware just handles basic redirects

  const isHandlerRoute = request.nextUrl.pathname.startsWith("/handler")

  if (isHandlerRoute) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip static files and api routes
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
}

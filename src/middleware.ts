import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const res = NextResponse.next()
  
  // Set pathname in headers for server components to access
  res.headers.set("x-pathname", pathname)
  
  const isImageRequest = /\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|avif)$/i.test(pathname)

  // Skip middleware logic for image/asset files
  if (isImageRequest) {
    return res
  }

  const hasGuest = req.cookies.get("guest_id")?.value
  
  // Set guest ID if not exists
  if (!hasGuest) {
    res.cookies.set("guest_id", uuidv4(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  // Skip middleware logic for admin routes (auth handled at page level)
  if (pathname.startsWith('/admin')) {
    return res
  }

  // Allow blog routes without authentication requirements
  if (pathname.startsWith('/blogs')) {
    return res
  }

  // Allow payment routes (authentication handled at page level)
  if (pathname.startsWith('/payment') || pathname.startsWith('/api/payments')) {
    return res
  }

  // Allow pricing pages (users need to access pricing to subscribe)
  if (pathname.startsWith('/pricing') || pathname.startsWith('/en/pricing')) {
    return res
  }

  // Always allow login
  if (pathname.startsWith('/auth/login')) {
    return res
  }

  // Authentication redirect to dashboard is handled at page level

  return res
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|images|api/webhooks|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|avif)$).*)",
  ],
}

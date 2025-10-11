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
  const hasCompletedQuiz = req.cookies.get("quiz_completed")?.value
  
  // Set guest ID if not exists
  if (!hasGuest) {
    res.cookies.set("guest_id", uuidv4(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  // Enforce quiz-before-signup for unauthenticated users (auth handled at page level)

  // Block access to signup unless quiz completed
  if (pathname.startsWith('/auth/signup') && !hasCompletedQuiz) {
    return NextResponse.redirect(new URL('/quiz', req.url))
  }

  // Always allow login regardless of quiz status
  if (pathname.startsWith('/auth/login')) {
    return res
  }

  // Redirect to quiz if not completed and not already on quiz/auth pages
  // Allow authenticated user pages without quiz requirement
  const authenticatedPages = ['/dashboard', '/profile', '/progress', '/sessions', '/games', '/settings']
  const isAuthenticatedPage = authenticatedPages.some(page => pathname.startsWith(page))
  
  if (
    !hasCompletedQuiz &&
    !pathname.startsWith('/quiz') &&
    !pathname.startsWith('/auth') &&
    pathname !== '/' &&
    !isAuthenticatedPage
  ) {
    return NextResponse.redirect(new URL('/quiz', req.url))
  }

  // Redirect from home to quiz if quiz not completed
  if (!hasCompletedQuiz && pathname === '/') {
    return NextResponse.redirect(new URL('/quiz', req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|images|api/webhooks|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|avif)$).*)",
  ],
}

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
  const hasStartedQuiz = req.cookies.get("quiz_started")?.value
  
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

  // Allow blog routes without authentication or quiz requirements
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

  // Determine if quiz is incomplete (started but not completed)
  const isQuizIncomplete = hasStartedQuiz && !hasCompletedQuiz

  // Enforce quiz-before-signup for unauthenticated users (auth handled at page level)

  // Block access to signup unless quiz completed
  if (pathname.startsWith('/auth/signup') && !hasCompletedQuiz) {
    return NextResponse.redirect(new URL('/quiz', req.url))
  }

  // Always allow login regardless of quiz status
  if (pathname.startsWith('/auth/login')) {
    return res
  }

  // Redirect to quiz if incomplete (started but not completed) and not already on quiz/auth pages
  // Allow authenticated user pages without quiz requirement
  const authenticatedPages = ['/dashboard', '/profile', '/progress', '/sessions', '/games', '/settings', 'learning-path', 'physical-activities']
  const isAuthenticatedPage = authenticatedPages.some(page => pathname.startsWith(page))
  
  if (
    isQuizIncomplete &&
    !pathname.startsWith('/quiz') &&
    !pathname.startsWith('/auth') &&
    pathname !== '/' &&
    !isAuthenticatedPage
  ) {
    return NextResponse.redirect(new URL('/quiz', req.url))
  }

  // No quiz guard on "/" - users can access landing page freely
  // Authentication redirect to dashboard is handled at page level

  return res
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|images|api/webhooks|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|avif)$).*)",
  ],
}

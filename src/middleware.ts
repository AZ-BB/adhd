import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname
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

  // Redirect to quiz if not completed and not already on quiz/auth pages
  if (!hasCompletedQuiz && !req.nextUrl.pathname.startsWith('/quiz') && !req.nextUrl.pathname.startsWith('/auth') && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/quiz', req.url))
  }

  // Redirect from home to quiz if quiz not completed
  if (!hasCompletedQuiz && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/quiz', req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|images|api/webhooks|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|avif)$).*)",
  ],
}

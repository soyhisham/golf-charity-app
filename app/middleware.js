// middleware.js
// This runs BEFORE every page loads.
// It checks if the user is logged in.
// If they try to visit /dashboard or /admin without being
// logged in, it kicks them to the login page automatically.

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if there's an active session
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Protected routes — must be logged in
  const protectedRoutes = ['/dashboard', '/admin', '/subscribe']

  // If visiting a protected route without a session → redirect to login
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // If already logged in and visiting login/signup → redirect to dashboard
  if ((pathname === '/login' || pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
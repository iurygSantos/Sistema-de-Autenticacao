import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Prevent logged-in users from accessing the login page
  if (request.nextUrl.pathname.startsWith('/login') && refreshToken) {
    return NextResponse.redirect(new URL('/', request.url)); // Or /admin depending on user role, but / is safe
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};

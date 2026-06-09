import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Parent area: require Auth.js session cookie
  if (pathname.startsWith('/parent') &&
      !pathname.startsWith('/parent/login') && !pathname.startsWith('/parent/register')) {
    const hasSession =
      req.cookies.has('authjs.session-token') || req.cookies.has('__Secure-authjs.session-token');
    if (!hasSession) return NextResponse.redirect(new URL('/parent/login', req.url));
  }

  // Child area: require child_session cookie
  if (pathname.startsWith('/child') && !pathname.startsWith('/child/enter')) {
    if (!req.cookies.has('child_session')) {
      return NextResponse.redirect(new URL('/child/enter', req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/parent/:path*', '/child/:path*'] };

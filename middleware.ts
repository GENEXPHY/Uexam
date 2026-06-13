import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register', '/'];
  const isPublicPath = publicPaths.includes(path);

  // Check if user is authenticated (you might want to use a more robust method)
  const token = request.cookies.get('auth-token')?.value;

  // For now, we'll just let the client-side handle authentication
  // In production, you'd want to validate the token here

  if (path.startsWith('/teacher') || path.startsWith('/student')) {
    // These routes require authentication, but we'll handle it client-side
    // The ProtectedRoute component will handle redirects
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

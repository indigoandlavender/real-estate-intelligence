import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require forensic access
const PROTECTED_API_ROUTES = [
  '/api/properties/forensic',
];

// Routes that require forensic access in full (not just API)
const PROTECTED_PAGE_ROUTES = [
  '/forensic',
];

// Valid access tokens
const VALID_TOKENS = ['TIFORT2026', 'FORENSIC_VIEWER_2026'];

function validateToken(token: string | null | undefined): boolean {
  if (!token) return false;
  return VALID_TOKENS.includes(token);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected API route
  const isProtectedAPI = PROTECTED_API_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  // Check if this is a protected page route
  const isProtectedPage = PROTECTED_PAGE_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedAPI) {
    // Check for forensic access token in cookie or header
    const cookieToken = request.cookies.get('forensic-access')?.value;
    const headerToken = request.headers.get('x-forensic-token');

    if (!validateToken(cookieToken) && !validateToken(headerToken)) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Valid forensic access token required.',
          instructions: 'Set cookie "forensic-access=TIFORT2026" or header "x-forensic-token: TIFORT2026"',
        },
        { status: 401 }
      );
    }
  }

  if (isProtectedPage) {
    // Check for forensic access token in cookie
    const cookieToken = request.cookies.get('forensic-access')?.value;

    if (!validateToken(cookieToken)) {
      // Redirect to property page with access modal trigger
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('access', 'required');
      return NextResponse.redirect(url);
    }
  }

  // Add security headers
  const response = NextResponse.next();

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match protected pages
    '/forensic/:path*',
  ],
};

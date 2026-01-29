/**
 * Next.js Middleware
 * 
 * Handles authentication for admin routes using custom JWT tokens.
 * Protects /admin/* routes and /api/admin/* endpoints.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Cookie names
const AUTH_COOKIE_NAME = 'apm_auth_token';
const LEGACY_COOKIE_NAME = 'admin_token'; // Legacy Directus cookie

/**
 * Verify JWT token in Edge Runtime (middleware)
 * Note: Can't use the full jwt.ts because it uses Node.js APIs
 */
async function verifyTokenEdge(token: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error('AUTH_SECRET not set');
    return false;
  }

  try {
    const secretKey = new TextEncoder().encode(secret);
    await jwtVerify(token, secretKey);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] ${request.method} ${pathname}`);

  // ================================
  // Protect Admin Pages
  // ================================
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Check for new auth cookie first, then legacy
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    const legacyToken = request.cookies.get(LEGACY_COOKIE_NAME);
    
    console.log(`[Middleware] Cookies: apm_auth_token=${authToken?.value ? 'present' : 'missing'}, admin_token=${legacyToken?.value ? 'present' : 'missing'}`);
    
    const token = authToken?.value || legacyToken?.value;

    // No token, redirect to login
    if (!token) {
      console.log('[Middleware] No token found, redirecting to login');
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Skip validation for dev tokens in development
    if (process.env.NODE_ENV === 'development' && token.startsWith('dev_token_')) {
      console.log('[Middleware] Dev token accepted for page');
      return NextResponse.next();
    }

    // Verify JWT token
    const isValid = await verifyTokenEdge(token);
    console.log(`[Middleware] JWT verification: ${isValid ? 'valid' : 'invalid'}`);
    
    if (!isValid) {
      // Token invalid, clear cookies and redirect
      console.log('[Middleware] Invalid token, redirecting to login');
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      loginUrl.searchParams.set('error', 'session_expired');
      
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(AUTH_COOKIE_NAME);
      response.cookies.delete(LEGACY_COOKIE_NAME);
      response.cookies.delete('admin_refresh_token');
      return response;
    }

    return NextResponse.next();
  }

  // ================================
  // Protect Admin API Routes
  // ================================
  if (pathname.startsWith('/api/admin')) {
    // Allow login and logout endpoints without auth
    if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
      console.log('[Middleware] Public API endpoint, allowing access');
      return NextResponse.next();
    }

    console.log('[Middleware] API route detected');
    
    // Check Authorization header or cookie
    const authHeader = request.headers.get('Authorization');
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    const legacyToken = request.cookies.get(LEGACY_COOKIE_NAME);
    
    console.log(`[Middleware] API Auth: header=${authHeader ? 'present' : 'missing'}, apm_token=${authToken?.value ? 'present' : 'missing'}, admin_token=${legacyToken?.value ? 'present' : 'missing'}`);
    
    let token: string | undefined;
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (authToken?.value) {
      token = authToken.value;
    } else if (legacyToken?.value) {
      token = legacyToken.value;
    }

    if (!token) {
      console.log('[Middleware] API: No token found');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log(`[Middleware] API Token: ${token.substring(0, 20)}...`);

    // Skip validation for dev tokens in development
    if (process.env.NODE_ENV === 'development' && token.startsWith('dev_token_')) {
      console.log('[Middleware] API: Dev token accepted');
      return NextResponse.next();
    }

    const isValid = await verifyTokenEdge(token);
    console.log(`[Middleware] API JWT verification: ${isValid ? 'valid' : 'invalid'}`);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // ================================
  // Redirect authenticated users from login page
  // ================================
  if (pathname === '/admin/login') {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    const legacyToken = request.cookies.get(LEGACY_COOKIE_NAME);
    
    if (authToken?.value || legacyToken?.value) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};

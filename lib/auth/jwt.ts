/**
 * JWT Utilities
 * 
 * JSON Web Token handling using jose library.
 * Supports 7-day session tokens for admin authentication.
 */

import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from 'jose'
import { cookies } from 'next/headers'
import type { JWTPayload, SessionUser } from '@/lib/validations/auth'

// ================================
// Configuration
// ================================

/**
 * Get the JWT secret as a Uint8Array for jose
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Token expiration time (7 days in seconds)
 */
const TOKEN_EXPIRATION = '7d'

/**
 * Cookie name for the auth token
 */
export const AUTH_COOKIE_NAME = 'apm_auth_token'

/**
 * Legacy cookie name (from old system)
 */
export const LEGACY_COOKIE_NAME = 'admin_token'

// ================================
// JWT Functions
// ================================

/**
 * Create a signed JWT token
 * @param user - User data to include in the token
 * @returns Signed JWT token string
 */
export async function createToken(user: SessionUser): Promise<string> {
  const token = await new SignJWT({
    sub: user.id.toString(),
    email: user.email,
    name: user.name,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(getJWTSecret())

  return token
}

/**
 * Verify a JWT token and return the payload
 * @param token - JWT token string to verify
 * @returns Decoded payload or null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret())
    
    // Ensure required fields exist
    if (!payload.sub || !payload.email || !payload.name || !payload.role) {
      return null
    }

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      iat: payload.iat as number,
      exp: payload.exp as number
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract SessionUser from JWT payload
 */
export function getSessionUserFromPayload(payload: JWTPayload): SessionUser {
  return {
    id: parseInt(payload.sub, 10),
    email: payload.email,
    name: payload.name,
    role: payload.role
  }
}

// ================================
// Cookie Management
// ================================

/**
 * Set auth cookie with the token
 * @param token - JWT token to store in cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/'
  })
}

/**
 * Get auth token from cookie
 * @returns Token string or null
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(AUTH_COOKIE_NAME)
  return cookie?.value ?? null
}

/**
 * Clear auth cookie (logout)
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

/**
 * Get current session from cookie
 * @returns SessionUser or null if not authenticated
 */
export async function getSession(): Promise<SessionUser | null> {
  const token = await getAuthToken()
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  return getSessionUserFromPayload(payload)
}

// ================================
// Token Refresh
// ================================

/**
 * Refresh token if it's close to expiration (less than 1 day left)
 * @returns New token if refreshed, null otherwise
 */
export async function refreshTokenIfNeeded(): Promise<string | null> {
  const token = await getAuthToken()
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  // Check if token expires in less than 1 day
  const now = Math.floor(Date.now() / 1000)
  const oneDay = 24 * 60 * 60
  const timeUntilExpiry = payload.exp - now

  if (timeUntilExpiry < oneDay) {
    // Create new token
    const user = getSessionUserFromPayload(payload)
    const newToken = await createToken(user)
    await setAuthCookie(newToken)
    return newToken
  }

  return null
}

// ================================
// Request-based Auth (for API routes)
// ================================

/**
 * Get session from Authorization header or cookie
 * For use in API routes
 */
export async function getSessionFromRequest(request: Request): Promise<SessionUser | null> {
  console.log('[Auth] getSessionFromRequest called')
  
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization')
  console.log('[Auth] Authorization header:', authHeader ? 'present' : 'missing')
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    console.log('[Auth] Bearer token found, length:', token.length)
    
    // Check for dev token in development
    if (process.env.NODE_ENV === 'development' && token.startsWith('dev_token_')) {
      console.log('[Auth] Dev token accepted from header')
      return createDevSession()
    }
    
    const payload = await verifyToken(token)
    if (payload) {
      console.log('[Auth] JWT verified from header, user:', payload.email)
      return getSessionUserFromPayload(payload)
    }
  }

  // Try cookies
  const cookieHeader = request.headers.get('cookie')
  console.log('[Auth] Cookie header:', cookieHeader ? cookieHeader.substring(0, 100) + '...' : 'missing')
  
  // Parse cookies manually for API routes
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader)
    
    // Check apm_auth_token first
    const apmToken = cookies[AUTH_COOKIE_NAME]
    if (apmToken) {
      console.log('[Auth] Found apm_auth_token cookie')
      if (process.env.NODE_ENV === 'development' && apmToken.startsWith('dev_token_')) {
        console.log('[Auth] Dev token accepted from apm_auth_token')
        return createDevSession()
      }
      const payload = await verifyToken(apmToken)
      if (payload) {
        console.log('[Auth] JWT verified from apm_auth_token')
        return getSessionUserFromPayload(payload)
      }
    }
    
    // Check legacy admin_token
    const legacyToken = cookies[LEGACY_COOKIE_NAME]
    if (legacyToken) {
      console.log('[Auth] Found admin_token cookie:', legacyToken.substring(0, 20) + '...')
      if (process.env.NODE_ENV === 'development' && legacyToken.startsWith('dev_token_')) {
        console.log('[Auth] Dev token accepted from admin_token')
        return createDevSession()
      }
      const payload = await verifyToken(legacyToken)
      if (payload) {
        console.log('[Auth] JWT verified from admin_token')
        return getSessionUserFromPayload(payload)
      }
    }
  }
  
  console.log('[Auth] No valid session found')
  return null
}

/**
 * Parse cookie header string into object
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) {
      cookies[name] = rest.join('=')
    }
  })
  return cookies
}

/**
 * Create a dev session for development mode
 */
function createDevSession(): SessionUser {
  return {
    id: 1,
    email: 'admin@apm-portal.id',
    name: 'Dev Admin',
    role: 'admin'
  }
}

/**
 * Require authentication in API route
 * Returns null if not authenticated (doesn't throw)
 */
export async function requireAuth(request: Request): Promise<SessionUser | null> {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      console.log('[Auth] requireAuth: No session found, returning null')
      return null
    }
    console.log('[Auth] requireAuth: Session found for', session.email)
    return session
  } catch (error) {
    console.error('[Auth] requireAuth error:', error)
    return null
  }
}

/**
 * Require specific role in API route
 * Returns null if not authenticated or wrong role
 */
export async function requireRole(
  request: Request,
  allowedRoles: string[]
): Promise<SessionUser | null> {
  const session = await requireAuth(request)
  if (!session) {
    return null
  }
  if (!allowedRoles.includes(session.role)) {
    console.log('[Auth] requireRole: User role', session.role, 'not in allowed roles', allowedRoles)
    return null
  }
  return session
}

/**
 * Rate Limiting Utility
 * 
 * Uses LRU Cache to implement rate limiting for API routes.
 * Prevents abuse and protects against brute force attacks.
 */

import { LRUCache } from 'lru-cache'

// ================================
// Types
// ================================

interface RateLimitOptions {
  /** Maximum number of requests allowed within the interval */
  limit: number
  /** Time window in milliseconds */
  interval: number
}

interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean
  /** Number of remaining requests */
  remaining: number
  /** Time in milliseconds until the rate limit resets */
  reset: number
  /** Total limit */
  limit: number
}

interface CacheEntry {
  count: number
  resetTime: number
}

// ================================
// Rate Limiter Class
// ================================

export class RateLimiter {
  private cache: LRUCache<string, CacheEntry>
  private options: RateLimitOptions

  constructor(options: RateLimitOptions) {
    this.options = options
    this.cache = new LRUCache<string, CacheEntry>({
      max: 10000, // Maximum 10k unique keys
      ttl: options.interval, // Auto-expire entries after interval
    })
  }

  /**
   * Check if a request from the given key is allowed
   * @param key - Unique identifier (usually IP address or user ID)
   */
  check(key: string): RateLimitResult {
    const now = Date.now()
    const entry = this.cache.get(key)

    // No existing entry, create new one
    if (!entry) {
      const resetTime = now + this.options.interval
      this.cache.set(key, { count: 1, resetTime })
      return {
        success: true,
        remaining: this.options.limit - 1,
        reset: resetTime,
        limit: this.options.limit
      }
    }

    // Entry exists but has expired (shouldn't happen due to TTL, but just in case)
    if (now > entry.resetTime) {
      const resetTime = now + this.options.interval
      this.cache.set(key, { count: 1, resetTime })
      return {
        success: true,
        remaining: this.options.limit - 1,
        reset: resetTime,
        limit: this.options.limit
      }
    }

    // Entry exists and is still valid
    if (entry.count >= this.options.limit) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        reset: entry.resetTime,
        limit: this.options.limit
      }
    }

    // Increment count
    entry.count++
    this.cache.set(key, entry)

    return {
      success: true,
      remaining: this.options.limit - entry.count,
      reset: entry.resetTime,
      limit: this.options.limit
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.cache.delete(key)
  }
}

// ================================
// Pre-configured Rate Limiters
// ================================

/**
 * General API rate limiter
 * 100 requests per minute
 */
export const apiRateLimiter = new RateLimiter({
  limit: 100,
  interval: 60 * 1000 // 1 minute
})

/**
 * Auth rate limiter (more restrictive)
 * 10 attempts per 15 minutes
 */
export const authRateLimiter = new RateLimiter({
  limit: 10,
  interval: 15 * 60 * 1000 // 15 minutes
})

/**
 * Registration/Submission rate limiter
 * 5 submissions per hour
 */
export const submissionRateLimiter = new RateLimiter({
  limit: 5,
  interval: 60 * 60 * 1000 // 1 hour
})

/**
 * File upload rate limiter
 * 20 uploads per hour
 */
export const uploadRateLimiter = new RateLimiter({
  limit: 20,
  interval: 60 * 60 * 1000 // 1 hour
})

// ================================
// Helper Functions
// ================================

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback to a default for development
  return '127.0.0.1'
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString()
  }
}

/**
 * Check rate limit and return error response if exceeded
 * @returns Response if rate limit exceeded, null if allowed
 */
export function checkRateLimit(
  request: Request,
  limiter: RateLimiter = apiRateLimiter
): Response | null {
  const ip = getClientIP(request)
  const result = limiter.check(ip)

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          ...createRateLimitHeaders(result)
        }
      }
    )
  }

  return null
}

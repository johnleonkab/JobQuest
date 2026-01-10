/**
 * Middleware para rate limiting en API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RATE_LIMITS } from '@/lib/utils/rate-limit';

/**
 * Obtiene el identificador único para rate limiting
 */
function getRateLimitIdentifier(request: NextRequest, userId?: string): string {
  // Priorizar user ID si está disponible
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback a IP address
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Middleware de rate limiting
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  config: { limit: number; window: number },
  userId?: string
): Promise<NextResponse | null> {
  const identifier = getRateLimitIdentifier(request, userId);
  const result = await rateLimit(identifier, config);

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
        },
      }
    );
  }

  // Agregar headers de rate limit a la respuesta
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());

  return null; // Continuar con el request
}



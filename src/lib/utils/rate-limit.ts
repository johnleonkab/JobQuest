/**
 * Utilidades para rate limiting
 * 
 * Nota: Para producción, se recomienda usar Upstash Redis.
 * Para desarrollo local, se usa un in-memory store.
 */

interface RateLimitConfig {
  limit: number;
  window: number; // en segundos
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory store para desarrollo (no usar en producción)
const memoryStore = new Map<string, { count: number; reset: number }>();

/**
 * Rate limiter simple usando memoria (solo para desarrollo)
 */
async function rateLimitMemory(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = config.window * 1000;
  const key = identifier;

  const record = memoryStore.get(key);

  if (!record || now > record.reset) {
    // Nueva ventana de tiempo
    memoryStore.set(key, {
      count: 1,
      reset: now + windowMs,
    });

    // Limpiar entradas expiradas periódicamente
    if (memoryStore.size > 1000) {
      for (const [k, v] of memoryStore.entries()) {
        if (now > v.reset) {
          memoryStore.delete(k);
        }
      }
    }

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: now + windowMs,
    };
  }

  if (record.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: record.reset,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - record.count,
    reset: record.reset,
  };
}

/**
 * Rate limiter usando Upstash Redis (para producción)
 */
async function rateLimitUpstash(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      throw new Error('Upstash Redis credentials not configured');
    }

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.limit, `${config.window} s`),
      analytics: true, // Habilitar analytics para debugging
    });

    const result = await ratelimit.limit(identifier);

    return {
      success: result.success,
      limit: config.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // Si falla Upstash, usar memoria como fallback
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Upstash Redis no disponible, usando memoria:', errorMessage);
    return rateLimitMemory(identifier, config);
  }
}

/**
 * Rate limiter principal
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Usar Upstash si está configurado, sino usar memoria
  const hasUpstashConfig =
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN;

  if (hasUpstashConfig) {
    try {
      return await rateLimitUpstash(identifier, config);
    } catch (error) {
      // Si falla, usar memoria como fallback
      console.warn('Falling back to memory store:', error);
      return rateLimitMemory(identifier, config);
    }
  }

  return rateLimitMemory(identifier, config);
}

/**
 * Verifica si Upstash Redis está configurado y funcionando
 */
export async function checkUpstashConnection(): Promise<{
  configured: boolean;
  working: boolean;
  error?: string;
}> {
  const hasConfig =
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!hasConfig) {
    return {
      configured: false,
      working: false,
      error: 'Upstash Redis credentials not configured',
    };
  }

  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    // Hacer un ping para verificar la conexión
    await redis.ping();

    return {
      configured: true,
      working: true,
    };
  } catch (error) {
    return {
      configured: true,
      working: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Configuraciones predefinidas de rate limiting
 */
export const RATE_LIMITS = {
  // Endpoints de lectura (más permisivos)
  read: {
    limit: 100,
    window: 60, // 100 requests por minuto
  },
  // Endpoints de escritura (más restrictivos)
  write: {
    limit: 30,
    window: 60, // 30 requests por minuto
  },
  // Endpoints críticos (muy restrictivos)
  critical: {
    limit: 10,
    window: 60, // 10 requests por minuto
  },
  // Logo extraction (muy restrictivo por costo)
  logoExtraction: {
    limit: 20,
    window: 60, // 20 requests por minuto
  },
  // AI endpoints (muy restrictivo por costo)
  ai: {
    limit: 15,
    window: 60, // 15 requests por minuto
  },
} as const;


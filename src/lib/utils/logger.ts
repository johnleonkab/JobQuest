/**
 * Utilidad para logging seguro que no expone información sensible
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Sanitiza un objeto para logging, removiendo información sensible
 */
function sanitizeForLogging(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Remover posibles tokens, passwords, etc.
    return data
      .replace(/password[=:]\s*[^\s,}]+/gi, 'password=***')
      .replace(/token[=:]\s*[^\s,}]+/gi, 'token=***')
      .replace(/api[_-]?key[=:]\s*[^\s,}]+/gi, 'api_key=***')
      .replace(/secret[=:]\s*[^\s,}]+/gi, 'secret=***')
      .replace(/authorization[=:]\s*[^\s,}]+/gi, 'authorization=***');
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeForLogging);
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = [
      'password',
      'token',
      'api_key',
      'apiKey',
      'secret',
      'authorization',
      'auth',
      'access_token',
      'refresh_token',
      'session',
      'cookie',
    ];

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
        sanitized[key] = '***';
      } else {
        sanitized[key] = sanitizeForLogging(value);
      }
    }

    return sanitized;
  }

  return data;
}

/**
 * Logger seguro que sanitiza información sensible
 */
export const logger = {
  error: (message: string, ...args: unknown[]) => {
    const sanitizedArgs = args.map(sanitizeForLogging);
    console.error(`[ERROR] ${message}`, ...sanitizedArgs);
  },

  warn: (message: string, ...args: unknown[]) => {
    const sanitizedArgs = args.map(sanitizeForLogging);
    console.warn(`[WARN] ${message}`, ...sanitizedArgs);
  },

  info: (message: string, ...args: unknown[]) => {
    if (!isProduction) {
      const sanitizedArgs = args.map(sanitizeForLogging);
      console.info(`[INFO] ${message}`, ...sanitizedArgs);
    }
  },

  debug: (message: string, ...args: unknown[]) => {
    if (!isProduction) {
      const sanitizedArgs = args.map(sanitizeForLogging);
      console.debug(`[DEBUG] ${message}`, ...sanitizedArgs);
    }
  },
};



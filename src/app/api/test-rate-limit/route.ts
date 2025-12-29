import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitMiddleware } from "@/middleware/rate-limit";
import { RATE_LIMITS } from "@/lib/utils/rate-limit";
import { rateLimit, checkUpstashConnection } from "@/lib/utils/rate-limit";

/**
 * Endpoint de prueba para verificar que el rate limiting funciona
 * GET /api/test-rate-limit
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || "anonymous";
    const identifier = user?.id || request.headers.get("x-forwarded-for") || "unknown";

    // Aplicar rate limiting
    const rateLimitResponse = await rateLimitMiddleware(
      request,
      { limit: 5, window: 60 }, // 5 requests por minuto para prueba
      user?.id
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Obtener información del rate limit actual
    const result = await rateLimit(identifier, { limit: 5, window: 60 });

    // Verificar conexión con Upstash
    const upstashStatus = await checkUpstashConnection();

    return NextResponse.json({
      success: true,
      message: "Rate limiting está funcionando correctamente",
      rateLimit: {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: new Date(result.reset).toISOString(),
      },
      configuration: {
        usingUpstash: upstashStatus.configured && upstashStatus.working,
        identifier: identifier,
        userId: userId || "anonymous",
        environment: process.env.NODE_ENV,
      },
      upstash: {
        configured: upstashStatus.configured,
        working: upstashStatus.working,
        error: upstashStatus.error,
        url: process.env.UPSTASH_REDIS_REST_URL
          ? "✅ Configurado"
          : "❌ No configurado",
        token: process.env.UPSTASH_REDIS_REST_TOKEN
          ? "✅ Configurado"
          : "❌ No configurado",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.stack : undefined)
          : undefined,
      },
      { status: 500 }
    );
  }
}


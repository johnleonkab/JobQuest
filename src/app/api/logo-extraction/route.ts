import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractCompanyLogo, extractLogosBatch } from "@/lib/logo-extraction";
import { logger } from "@/lib/utils/logger";
import { rateLimitMiddleware } from "@/middleware/rate-limit";
import { RATE_LIMITS } from "@/lib/utils/rate-limit";

/**
 * API Route for Logo Extraction
 * 
 * GET /api/logo-extraction?company=CompanyName
 * POST /api/logo-extraction (body: { companies: string[] })
 */
export async function GET(request: NextRequest) {
  // Verificar autenticación
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const rateLimitResponse = await rateLimitMiddleware(
    request,
    RATE_LIMITS.logoExtraction,
    user.id
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const searchParams = request.nextUrl.searchParams;
  const companyName = searchParams.get("company");
  const companyWebsite = searchParams.get("website") || undefined;

  if (!companyName) {
    return NextResponse.json(
      { error: "Company name is required" },
      { status: 400 }
    );
  }

  try {
    const result = await extractCompanyLogo(companyName, companyWebsite);
    return NextResponse.json(result);
  } catch (error) {
    logger.error("Error extracting logo", { error, companyName, companyWebsite });
    return NextResponse.json(
      {
        logoUrl: null,
        source: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const rateLimitResponse = await rateLimitMiddleware(
    request,
    RATE_LIMITS.logoExtraction,
    user.id
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  let companiesCount = 0;
  try {
    const body = await request.json();
    const { companies } = body;
    companiesCount = Array.isArray(companies) ? companies.length : 0;

    if (!Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json(
        { error: "Companies array is required" },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    const MAX_BATCH_SIZE = 50;
    if (companies.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BATCH_SIZE} companies per batch` },
        { status: 400 }
      );
    }

    // Validar que todos los elementos sean strings
    if (!companies.every((c) => typeof c === 'string' && c.trim().length > 0)) {
      return NextResponse.json(
        { error: "All companies must be non-empty strings" },
        { status: 400 }
      );
    }

    // Limitar longitud de cada nombre de empresa
    const MAX_COMPANY_NAME_LENGTH = 200;
    const invalidCompanies = companies.filter((c) => c.length > MAX_COMPANY_NAME_LENGTH);
    if (invalidCompanies.length > 0) {
      return NextResponse.json(
        { error: `Company names must be less than ${MAX_COMPANY_NAME_LENGTH} characters` },
        { status: 400 }
      );
    }

    const results = await extractLogosBatch(companies);
    return NextResponse.json(results);
  } catch (error) {
    logger.error("Error extracting logos batch", { error, count: companiesCount });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


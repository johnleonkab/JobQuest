import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { extractCompanyLogo } from "@/lib/logo-extraction";
import { createErrorResponse } from "@/lib/utils/error-handler";
import { isValidUUID } from "@/lib/utils/uuid-validator";
import { validateFieldLength } from "@/lib/utils/input-validator";
import { validatePositiveInteger, validateStringArray, validateEnum, validateJSONObject, validateURL } from "@/lib/utils/request-validator";
import { logger } from "@/lib/utils/logger";
import { rateLimitMiddleware } from "@/middleware/rate-limit";
import { RATE_LIMITS } from "@/lib/utils/rate-limit";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const id = searchParams.get("id");

  // If ID is provided, return single offer
  if (id) {
    // Validar formato UUID
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("job_offers")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      const errorResponse = createErrorResponse(error, "Error al obtener la oferta de trabajo");
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Clean up invalid logo URL if present
    if (data && typeof data === 'object' && data !== null) {
      const offerData = data as any;
      if (offerData.company_logo_url && 
          typeof offerData.company_logo_url === 'string' && 
          !offerData.company_logo_url.startsWith('http://') && 
          !offerData.company_logo_url.startsWith('https://')) {
        offerData.company_logo_url = null;
      }
    }

    return NextResponse.json(data);
  }

  let query = supabase
    .from("job_offers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    // Validar y sanitizar el parámetro de búsqueda
    const sanitizedSearch = search.trim().substring(0, 200); // Limitar a 200 caracteres
    if (sanitizedSearch.length > 0) {
      // Escapar caracteres especiales que podrían causar problemas
      const escapedSearch = sanitizedSearch.replace(/[%_\\]/g, '\\$&');
      query = query.or(
        `company_name.ilike.%${escapedSearch}%,position.ilike.%${escapedSearch}%,job_description.ilike.%${escapedSearch}%`
      );
    }
  }

  const { data, error } = await query;

  // Clean up any invalid logo URLs in the response (for existing data)
  if (data && Array.isArray(data)) {
    data.forEach((offer: any) => {
      if (offer?.company_logo_url && 
          typeof offer.company_logo_url === 'string' && 
          !offer.company_logo_url.startsWith('http://') && 
          !offer.company_logo_url.startsWith('https://')) {
        // Invalid logo URL - set to null
        offer.company_logo_url = null;
      }
    });
  } else if (data && typeof data === 'object' && !Array.isArray(data) && data !== null) {
    const offerData = data as any;
    if (offerData.company_logo_url && 
        typeof offerData.company_logo_url === 'string' && 
        !offerData.company_logo_url.startsWith('http://') && 
        !offerData.company_logo_url.startsWith('https://')) {
      // Invalid logo URL - set to null
      offerData.company_logo_url = null;
    }
  }

  if (error) {
    const errorResponse = createErrorResponse(error, "Error al obtener las ofertas de trabajo");
    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting para escritura
  const rateLimitResponse = await rateLimitMiddleware(
    request,
    RATE_LIMITS.write,
    user.id
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = await request.json();
  const {
    company_name,
    position,
    job_description,
    status = "saved",
    salary_range_min,
    salary_range_max,
    job_type,
    tags = [],
    notes,
    company_website,
    company_logo_url,
    selected_cv_sections,
  } = body;

  // Validar tipos de datos
  const statusValidation = validateEnum(status, "status", [
    "saved",
    "contacted",
    "applied",
    "interview",
    "offer",
    "rejected",
    "accepted",
  ] as const);
  if (!statusValidation.valid) {
    return NextResponse.json(
      { error: statusValidation.error },
      { status: 400 }
    );
  }

  if (salary_range_min !== undefined && salary_range_min !== null) {
    const salaryMinValidation = validatePositiveInteger(salary_range_min, "salary_range_min");
    if (!salaryMinValidation.valid) {
      return NextResponse.json(
        { error: salaryMinValidation.error },
        { status: 400 }
      );
    }
  }

  if (salary_range_max !== undefined && salary_range_max !== null) {
    const salaryMaxValidation = validatePositiveInteger(salary_range_max, "salary_range_max");
    if (!salaryMaxValidation.valid) {
      return NextResponse.json(
        { error: salaryMaxValidation.error },
        { status: 400 }
      );
    }
  }

  // Validar que salary_range_max >= salary_range_min si ambos están presentes
  if (
    salary_range_min !== undefined &&
    salary_range_max !== undefined &&
    salary_range_min !== null &&
    salary_range_max !== null &&
    salary_range_max < salary_range_min
  ) {
    return NextResponse.json(
      { error: "salary_range_max debe ser mayor o igual a salary_range_min" },
      { status: 400 }
    );
  }

  if (job_type !== undefined && job_type !== null) {
    const jobTypeValidation = validateEnum(job_type, "job_type", [
      "full-time",
      "part-time",
      "contract",
      "internship",
    ] as const);
    if (!jobTypeValidation.valid) {
      return NextResponse.json(
        { error: jobTypeValidation.error },
        { status: 400 }
      );
    }
  }

  const tagsValidation = validateStringArray(tags, "tags");
  if (!tagsValidation.valid) {
    return NextResponse.json(
      { error: tagsValidation.error },
      { status: 400 }
    );
  }

  if (company_website !== undefined && company_website !== null) {
    const websiteValidation = validateURL(company_website, "company_website");
    if (!websiteValidation.valid) {
      return NextResponse.json(
        { error: websiteValidation.error },
        { status: 400 }
      );
    }
  }

  if (selected_cv_sections !== undefined && selected_cv_sections !== null) {
    const cvSectionsValidation = validateJSONObject(selected_cv_sections, "selected_cv_sections");
    if (!cvSectionsValidation.valid) {
      return NextResponse.json(
        { error: cvSectionsValidation.error },
        { status: 400 }
      );
    }
  }

  if (!company_name || !position) {
    return NextResponse.json(
      { error: "company_name and position are required" },
      { status: 400 }
    );
  }

  // Validar longitud de campos
  const companyNameValidation = validateFieldLength(company_name, "company_name", true);
  if (!companyNameValidation.valid) {
    return NextResponse.json(
      { error: companyNameValidation.error },
      { status: 400 }
    );
  }

  const positionValidation = validateFieldLength(position, "position", true);
  if (!positionValidation.valid) {
    return NextResponse.json(
      { error: positionValidation.error },
      { status: 400 }
    );
  }

  if (job_description) {
    const jobDescValidation = validateFieldLength(job_description, "job_description");
    if (!jobDescValidation.valid) {
      return NextResponse.json(
        { error: jobDescValidation.error },
        { status: 400 }
      );
    }
  }

  if (notes) {
    const notesValidation = validateFieldLength(notes, "notes");
    if (!notesValidation.valid) {
      return NextResponse.json(
        { error: notesValidation.error },
        { status: 400 }
      );
    }
  }

  // Auto-extract logo if not provided and company name exists
  let finalLogoUrl = company_logo_url || null;
  if (!finalLogoUrl && company_name) {
    try {
      const logoResult = await extractCompanyLogo(company_name, company_website);
      if (logoResult.logoUrl) {
        finalLogoUrl = logoResult.logoUrl;
      }
    } catch (error) {
      logger.error("Error auto-extracting logo", { error });
      // Continue without logo if extraction fails
    }
  }

  // Validate logo URL if provided
  if (finalLogoUrl && typeof finalLogoUrl === 'string') {
    // Only accept URLs that start with http:// or https://
    if (!finalLogoUrl.startsWith('http://') && !finalLogoUrl.startsWith('https://')) {
      logger.warn("Invalid logo URL provided, ignoring", { logoUrl: finalLogoUrl });
      finalLogoUrl = null;
    }
  }

  const { data, error } = await supabase
    .from("job_offers")
    .insert({
      user_id: user.id,
      company_name,
      position,
      job_description,
      status,
      salary_range_min,
      salary_range_max,
      job_type,
      tags: tags || [],
      notes,
      company_website: company_website || null,
      company_logo_url: finalLogoUrl,
      selected_cv_sections: selected_cv_sections || {},
    })
    .select()
    .single();

  if (error) {
    const errorResponse = createErrorResponse(error, "Error al crear la oferta de trabajo");
    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting para escritura
  const rateLimitResponse = await rateLimitMiddleware(
    request,
    RATE_LIMITS.write,
    user.id
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Validar formato UUID
  if (!isValidUUID(id)) {
    return NextResponse.json(
      { error: "Invalid ID format" },
      { status: 400 }
    );
  }

  // Ensure selected_cv_sections is properly formatted as JSONB
  if (updates.selected_cv_sections !== undefined) {
    // If it's null or undefined, set it to empty object
    if (updates.selected_cv_sections === null || updates.selected_cv_sections === undefined) {
      updates.selected_cv_sections = {};
    }
    // Ensure it's a plain object (not an array or other type)
    if (typeof updates.selected_cv_sections !== 'object' || Array.isArray(updates.selected_cv_sections)) {
      updates.selected_cv_sections = {};
    }
  }

  // Auto-extract logo if company_name is being updated and logo is not provided
  if (updates.company_name && !updates.company_logo_url) {
    try {
      // Check if logo already exists
      const { data: currentOffer } = await supabase
        .from("job_offers")
        .select("company_name, company_logo_url, company_website")
        .eq("id", id)
        .single();

      // Only extract if logo doesn't exist or company name/website changed
      const websiteChanged = updates.company_website !== undefined && 
                            currentOffer?.company_website !== updates.company_website;
      const nameChanged = currentOffer?.company_name !== updates.company_name;
      
      if (!currentOffer?.company_logo_url || nameChanged || websiteChanged) {
        const logoResult = await extractCompanyLogo(
          updates.company_name, 
          updates.company_website || currentOffer?.company_website
        );
        if (logoResult.logoUrl) {
          updates.company_logo_url = logoResult.logoUrl;
        }
      }
    } catch (error) {
      logger.error("Error auto-extracting logo", { error });
      // Continue without logo if extraction fails
    }
  }

  // Validate logo URL if provided
  if (updates.company_logo_url !== undefined) {
    if (updates.company_logo_url === "" || updates.company_logo_url === null) {
      // Empty string or null means remove logo
      updates.company_logo_url = null;
    } else if (typeof updates.company_logo_url === 'string') {
      // Only accept URLs that start with http:// or https://
      if (!updates.company_logo_url.startsWith('http://') && !updates.company_logo_url.startsWith('https://')) {
        // If it's not a valid URL, ignore it (don't save invalid data)
        console.warn(`Invalid logo URL provided: ${updates.company_logo_url}, ignoring`);
        delete updates.company_logo_url; // Don't update the logo field
      }
    }
  }

  // Validate website URL if provided
  if (updates.company_website !== undefined) {
    if (updates.company_website === "" || updates.company_website === null) {
      updates.company_website = null;
    } else if (typeof updates.company_website === 'string') {
      // Basic URL validation - should start with http:// or https://
      const website = updates.company_website.trim();
      if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        // Auto-add https:// if not present
        updates.company_website = `https://${website}`;
      }
    }
  }

  const { data, error } = await supabase
    .from("job_offers")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    logger.error("Error updating job offer", { error, updates });
    const errorResponse = createErrorResponse(error, "Error al actualizar la oferta de trabajo");
    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting para escritura
  const rateLimitResponse = await rateLimitMiddleware(
    request,
    RATE_LIMITS.write,
    user.id
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Validar formato UUID
  if (!isValidUUID(id)) {
    return NextResponse.json(
      { error: "Invalid ID format" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("job_offers")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Error deleting job offer", { error, id });
    const errorResponse = createErrorResponse(error, "Error al eliminar la oferta de trabajo");
    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json({ success: true });
}


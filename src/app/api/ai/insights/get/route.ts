import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CVData } from "@/types/cv";

/**
 * API Route para obtener el último análisis de IA
 * 
 * GET /api/ai/insights/get?cvData={JSON}
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener el último análisis
    const { data: insight, error: fetchError } = await supabase
      .from("ai_insights")
      .select("id, cv_snapshot, analysis_text, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !insight) {
      return NextResponse.json({
        hasAnalysis: false,
      });
    }

    // Obtener el CV actual desde el query param
    const cvDataParam = request.nextUrl.searchParams.get("cvData");
    let cvData: CVData | null = null;
    
    if (cvDataParam) {
      try {
        // Validar tamaño máximo del JSON (1MB)
        if (cvDataParam.length > 1024 * 1024) {
          return NextResponse.json(
            { error: "CV data too large" },
            { status: 400 }
          );
        }
        cvData = JSON.parse(cvDataParam);
      } catch (error) {
        // Si no se puede parsear, retornar error en lugar de ignorar silenciosamente
        console.error("Error parsing CV data:", error);
        return NextResponse.json(
          { error: "Invalid CV data format" },
          { status: 400 }
        );
      }
    }

    // Si tenemos el CV actual, comparar con el snapshot
    let needsRegeneration = true;
    if (cvData) {
      const currentSnapshot = createCVSnapshot(cvData);
      needsRegeneration = compareCVSnapshots(insight.cv_snapshot, currentSnapshot);
    }

    return NextResponse.json({
      hasAnalysis: true,
      analysis: {
        id: insight.id,
        text: insight.analysis_text,
        createdAt: insight.created_at,
        updatedAt: insight.updated_at,
      },
      needsRegeneration: needsRegeneration,
    });
  } catch (error) {
    console.error("Error getting AI insight:", error);
    return NextResponse.json(
      { error: "Error al obtener el análisis" },
      { status: 500 }
    );
  }
}

/**
 * Crea un snapshot del CV para comparación
 */
function createCVSnapshot(cvData: CVData): any {
  return {
    experience: cvData.experience?.map((exp) => ({
      id: exp.id,
      position: exp.position,
      company_name: exp.company_name,
      start_date: exp.start_date,
      end_date: exp.end_date,
      is_current: exp.is_current,
    })) || [],
    education: cvData.education?.map((edu) => ({
      id: edu.id,
      title: edu.title,
      institution: edu.institution,
      start_date: edu.start_date,
      end_date: edu.end_date,
    })) || [],
    certifications: cvData.certifications?.map((cert) => ({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
    })) || [],
    languages: cvData.languages?.map((lang) => ({
      id: lang.id,
      language: lang.language,
      level: lang.level,
    })) || [],
    projects: cvData.projects?.map((proj) => ({
      id: proj.id,
      name: proj.name,
    })) || [],
    volunteering: cvData.volunteering?.map((vol) => ({
      id: vol.id,
      title: vol.title,
      organization: vol.organization,
      start_date: vol.start_date,
      end_date: vol.end_date,
    })) || [],
  };
}

/**
 * Compara dos snapshots del CV para detectar cambios
 */
function compareCVSnapshots(oldSnapshot: any, newSnapshot: any): boolean {
  // Comparar cada sección
  const sections = [
    "experience",
    "education",
    "certifications",
    "languages",
    "projects",
    "volunteering",
  ];

  for (const section of sections) {
    const old = oldSnapshot[section] || [];
    const new_ = newSnapshot[section] || [];

    // Comparar cantidad de elementos
    if (old.length !== new_.length) {
      return true; // Ha cambiado
    }

    // Comparar cada elemento por ID y campos clave
    for (let i = 0; i < old.length; i++) {
      const oldItem = old[i];
      const newItem = new_[i];

      // Si no tienen el mismo ID, ha cambiado
      if (oldItem.id !== newItem.id) {
        return true;
      }

      // Comparar campos clave según la sección
      if (section === "experience") {
        if (
          oldItem.position !== newItem.position ||
          oldItem.company_name !== newItem.company_name ||
          oldItem.start_date !== newItem.start_date ||
          oldItem.end_date !== newItem.end_date ||
          oldItem.is_current !== newItem.is_current
        ) {
          return true;
        }
      } else if (section === "education") {
        if (
          oldItem.title !== newItem.title ||
          oldItem.institution !== newItem.institution ||
          oldItem.start_date !== newItem.start_date ||
          oldItem.end_date !== newItem.end_date
        ) {
          return true;
        }
      } else if (section === "certifications") {
        if (
          oldItem.name !== newItem.name ||
          oldItem.issuer !== newItem.issuer
        ) {
          return true;
        }
      } else if (section === "languages") {
        if (
          oldItem.language !== newItem.language ||
          oldItem.level !== newItem.level
        ) {
          return true;
        }
      } else if (section === "projects") {
        if (oldItem.name !== newItem.name) {
          return true;
        }
      } else if (section === "volunteering") {
        if (
          oldItem.title !== newItem.title ||
          oldItem.organization !== newItem.organization ||
          oldItem.start_date !== newItem.start_date ||
          oldItem.end_date !== newItem.end_date
        ) {
          return true;
        }
      }
    }
  }

  return false; // No ha cambiado
}


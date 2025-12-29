import { NextRequest, NextResponse } from "next/server";
import { createGeminiService } from "@/lib/ai/gemini";
import { getPrompt } from "@/config/ai/prompts";
import { createClient } from "@/lib/supabase/server";
import { rateLimitMiddleware } from "@/middleware/rate-limit";
import { RATE_LIMITS } from "@/lib/utils/rate-limit";

/**
 * API Route para generar insights de AI usando Gemini
 * 
 * POST /api/ai/insights
 * Body: {
 *   promptId: string,  // ID del prompt del sistema a usar
 *   userMessage: string,  // Mensaje del usuario
 *   cvData?: CVData,  // Datos del CV (opcional)
 * }
 */
export async function POST(request: NextRequest) {
  // Verificar autenticación y aplicar rate limiting
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting para AI endpoints
  const rateLimitResponse = await rateLimitMiddleware(
    request,
    RATE_LIMITS.ai,
    user.id
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Parsear el body
    const body = await request.json();
    const { promptId, userMessage, cvData, chatHistory } = body;

    if (!promptId || !userMessage) {
      return NextResponse.json(
        { error: "promptId y userMessage son requeridos" },
        { status: 400 }
      );
    }

    // Obtener el prompt del sistema
    const systemPrompt = getPrompt(promptId);
    if (!systemPrompt) {
      return NextResponse.json(
        { error: `Prompt con ID '${promptId}' no encontrado` },
        { status: 400 }
      );
    }

    // Crear el servicio de Gemini
    const geminiService = createGeminiService();

    // Si hay historial de chat, usar generateContentWithHistory
    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
      // Construir el prompt del sistema con contexto del CV si está disponible
      let systemPromptContent = systemPrompt.content;
      if (cvData) {
        const cvContext = formatCVDataForPrompt(cvData);
        systemPromptContent = `${systemPromptContent}\n\n## Contexto del CV del usuario:\n${cvContext}`;
      }

      // Crear un nuevo prompt con el contexto
      const contextualPrompt = {
        ...systemPrompt,
        content: systemPromptContent,
      };

      // Convertir el historial al formato esperado
      // Gemini usa "model" en lugar de "assistant"
      const messages = chatHistory.map((msg: { role: string; content: string }) => ({
        role: (msg.role === "user" ? "user" : "model") as "user" | "model",
        content: msg.content,
      }));

      // Agregar el mensaje actual del usuario
      messages.push({
        role: "user",
        content: userMessage,
      });

      // Generar contenido con historial
      const response = await geminiService.generateContentWithHistory(
        contextualPrompt,
        messages
      );

      return NextResponse.json({
        success: true,
        text: response.text,
        usage: response.usage,
        promptId: systemPrompt.id,
        promptName: systemPrompt.name,
      });
    }

    // Si no hay historial, usar generateContent normal
    // Construir el mensaje del usuario con contexto del CV si está disponible
    let fullUserMessage = userMessage;
    if (cvData) {
      // Formatear los datos del CV para incluir en el contexto
      const cvContext = formatCVDataForPrompt(cvData);
      fullUserMessage = `${cvContext}\n\n${userMessage}`;
    }

    // Generar contenido
    const response = await geminiService.generateContent(
      systemPrompt,
      fullUserMessage
    );

    return NextResponse.json({
      success: true,
      text: response.text,
      usage: response.usage,
      promptId: systemPrompt.id,
      promptName: systemPrompt.name,
    });
  } catch (error) {
    console.error("Error generating AI insights:", error);
    
    // Manejar errores específicos
    if (error instanceof Error) {
      // Error de API key no configurada
      if (error.message.includes("GEMINI_API_KEY")) {
        return NextResponse.json(
          { 
            error: "GEMINI_API_KEY no está configurada. Por favor, configura la variable de entorno GEMINI_API_KEY en tu archivo .env.local",
            code: "MISSING_API_KEY"
          },
          { status: 500 }
        );
      }
      
      // Error de API de Gemini
      if (error.message.includes("API error")) {
        const errorDetails = error.message.replace("API error: ", "");
        return NextResponse.json(
          { 
            error: `Error al comunicarse con Gemini API: ${errorDetails}`,
            details: errorDetails,
            code: "GEMINI_API_ERROR"
          },
          { status: 502 }
        );
      }
      
      // Error de conexión
      if (error.message.includes("conexión") || error.message.includes("fetch")) {
        return NextResponse.json(
          { 
            error: "Error de conexión. Verifica tu conexión a internet.",
            code: "CONNECTION_ERROR"
          },
          { status: 503 }
        );
      }
      
      // Otro error
      return NextResponse.json(
        { 
          error: error.message || "Error al generar insights",
          code: "UNKNOWN_ERROR"
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}

/**
 * Formatea los datos del CV para incluirlos en el prompt
 */
function formatCVDataForPrompt(cvData: any): string {
  const sections: string[] = [];

  if (cvData.experience && cvData.experience.length > 0) {
    sections.push("## Experiencia Laboral:");
    cvData.experience.forEach((exp: any) => {
      sections.push(
        `- ${exp.position} en ${exp.company_name} (${exp.start_date} - ${exp.end_date || "Presente"})`
      );
      if (exp.description) {
        sections.push(`  Descripción: ${exp.description}`);
      }
      if (exp.skills && exp.skills.length > 0) {
        sections.push(`  Habilidades: ${exp.skills.join(", ")}`);
      }
    });
  }

  if (cvData.education && cvData.education.length > 0) {
    sections.push("\n## Educación:");
    cvData.education.forEach((edu: any) => {
      sections.push(
        `- ${edu.title} en ${edu.institution} (${edu.start_date} - ${edu.end_date || "Presente"})`
      );
      if (edu.notes) {
        sections.push(`  Notas: ${edu.notes}`);
      }
      if (edu.skills && edu.skills.length > 0) {
        sections.push(`  Habilidades: ${edu.skills.join(", ")}`);
      }
    });
  }

  if (cvData.certifications && cvData.certifications.length > 0) {
    sections.push("\n## Certificaciones:");
    cvData.certifications.forEach((cert: any) => {
      sections.push(`- ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ""}`);
      if (cert.description) {
        sections.push(`  Descripción: ${cert.description}`);
      }
      if (cert.skills && cert.skills.length > 0) {
        sections.push(`  Habilidades: ${cert.skills.join(", ")}`);
      }
    });
  }

  if (cvData.languages && cvData.languages.length > 0) {
    sections.push("\n## Idiomas:");
    cvData.languages.forEach((lang: any) => {
      sections.push(`- ${lang.language}: ${lang.level}`);
    });
  }

  if (cvData.projects && cvData.projects.length > 0) {
    sections.push("\n## Proyectos:");
    cvData.projects.forEach((proj: any) => {
      sections.push(`- ${proj.name}`);
      if (proj.description) {
        sections.push(`  ${proj.description}`);
      }
      if (proj.start_date) {
        sections.push(`  Fecha: ${proj.start_date} - ${proj.end_date || "Presente"}`);
      }
    });
  }

  if (cvData.volunteering && cvData.volunteering.length > 0) {
    sections.push("\n## Voluntariado:");
    cvData.volunteering.forEach((vol: any) => {
      sections.push(`- ${vol.title} en ${vol.organization} (${vol.start_date} - ${vol.end_date || "Presente"})`);
      if (vol.description) {
        sections.push(`  ${vol.description}`);
      }
    });
  }

  return sections.join("\n");
}


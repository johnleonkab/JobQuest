import { useState, useCallback } from "react";
import { useAIInsights } from "./useAIInsights";

export interface SectionImprovementResult {
  description: string;
  tags: string[];
  changes: string;
}

export interface UseAISectionImproverReturn {
  improveSection: (sectionData: {
    sectionType: string;
    description: string;
    tags: string[];
    context?: Record<string, any>;
  }) => Promise<SectionImprovementResult | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para mejorar secciones del CV con IA
 */
export function useAISectionImprover(): UseAISectionImproverReturn {
  const { generateInsights, loading, error } = useAIInsights();
  const [improvementLoading, setImprovementLoading] = useState(false);
  const [improvementError, setImprovementError] = useState<string | null>(null);

  const improveSection = useCallback(
    async (sectionData: {
      sectionType: string;
      description: string;
      tags: string[];
      context?: Record<string, any>;
    }): Promise<SectionImprovementResult | null> => {
      setImprovementLoading(true);
      setImprovementError(null);

      try {
        // Validar que haya contenido para mejorar
        if (!sectionData.description || sectionData.description.trim().length === 0) {
          throw new Error(
            "Escribe una descripción primero para poder mejorarla"
          );
        }

        // Construir el mensaje para la IA
        const userMessage = buildImprovementMessage(sectionData);

        // Llamar a la IA
        const response = await generateInsights({
          promptId: "section_improvement",
          userMessage,
        });

        // Parsear la respuesta JSON
        let improvementResult: SectionImprovementResult;
        try {
          // Intentar parsear como JSON
          const jsonMatch = response.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            improvementResult = JSON.parse(jsonMatch[0]);
          } else {
            // Si no es JSON válido, intentar extraer información del texto
            throw new Error("La respuesta no está en formato JSON válido");
          }
        } catch (parseError) {
          // Si falla el parseo, intentar extraer información del texto
          const lines = response.text.split("\n");
          const descriptionMatch = response.text.match(/description["\s:]+"([^"]+)"/i);
          const tagsMatch = response.text.match(/tags["\s:]+\[([^\]]+)\]/i);
          const changesMatch = response.text.match(/changes["\s:]+"([^"]+)"/i);

          improvementResult = {
            description:
              descriptionMatch?.[1] ||
              lines.find((l) => l.includes("descripción") || l.includes("description")) ||
              sectionData.description,
            tags: tagsMatch
              ? tagsMatch[1]
                  .split(",")
                  .map((t) => t.trim().replace(/["']/g, ""))
                  .filter((t) => t.length > 0)
              : sectionData.tags,
            changes:
              changesMatch?.[1] ||
              "Mejoras en redacción, estructura y sugerencias de tags",
          };
        }

        // Validar que el resultado tenga sentido
        if (!improvementResult.description || improvementResult.description.trim().length < 10) {
          improvementResult.description = sectionData.description;
        }

        if (!Array.isArray(improvementResult.tags) || improvementResult.tags.length === 0) {
          improvementResult.tags = sectionData.tags;
        }

        return improvementResult;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al mejorar la sección con IA";
        setImprovementError(errorMessage);
        console.error("Error improving section:", err);
        return null;
      } finally {
        setImprovementLoading(false);
      }
    },
    [generateInsights]
  );

  return {
    improveSection,
    loading: improvementLoading || loading,
    error: improvementError || error,
  };
}

/**
 * Construye el mensaje para mejorar una sección
 */
function buildImprovementMessage(sectionData: {
  sectionType: string;
  description: string;
  tags: string[];
  context?: Record<string, any>;
}): string {
  const parts: string[] = [];

  parts.push(`Tipo de sección: ${sectionData.sectionType}`);
  parts.push("");

  if (sectionData.context) {
    parts.push("Contexto:");
    Object.entries(sectionData.context).forEach(([key, value]) => {
      if (value) {
        parts.push(`- ${key}: ${value}`);
      }
    });
    parts.push("");
  }

  parts.push("Descripción actual:");
  parts.push(sectionData.description);
  parts.push("");

  if (sectionData.tags && sectionData.tags.length > 0) {
    parts.push("Tags actuales:");
    parts.push(sectionData.tags.join(", "));
    parts.push("");
  }

  parts.push(
    "Por favor, mejora la descripción corrigiendo errores, mejorando la redacción y haciéndola más impactante. También sugiere tags relevantes para ATS."
  );

  return parts.join("\n");
}


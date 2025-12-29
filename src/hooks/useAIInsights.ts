"use client";

import { useState, useCallback } from "react";
import type { CVData } from "@/types/cv";

export interface AIInsightsRequest {
  promptId: string;
  userMessage: string;
  cvData?: CVData;
  chatHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AIInsightsResponse {
  text: string;
  usage?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
  promptId: string;
  promptName: string;
}

export interface UseAIInsightsReturn {
  generateInsights: (request: AIInsightsRequest) => Promise<AIInsightsResponse>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para generar insights de AI usando Gemini
 * 
 * @example
 * const { generateInsights, loading, error } = useAIInsights();
 * 
 * const handleAnalyze = async () => {
 *   const response = await generateInsights({
 *     promptId: 'cv_analysis',
 *     userMessage: 'Analiza mi CV y dame sugerencias',
 *     cvData: myCVData
 *   });
 *   console.log(response.text);
 * };
 */
export function useAIInsights(): UseAIInsightsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = useCallback(
    async (request: AIInsightsRequest): Promise<AIInsightsResponse> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/ai/insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: `Error ${response.status}: ${response.statusText}` };
          }
          
          // Usar el mensaje de error del servidor si está disponible
          const errorMessage = errorData.error || errorData.message || `Error ${response.status}`;
          throw new Error(errorMessage);
        }

        const data: AIInsightsResponse = await response.json();
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al generar insights";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    generateInsights,
    loading,
    error,
  };
}


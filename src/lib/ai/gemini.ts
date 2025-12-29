/**
 * Servicio de Gemini AI
 * 
 * Servicio desacoplado para interactuar con Google Gemini API.
 * Los prompts del sistema se pasan como parámetros para mantener
 * la separación de responsabilidades.
 */

import type { SystemPrompt } from "@/config/ai/prompts";

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
}

export class GeminiService {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || "gemini-2.0-flash-exp";
    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  /**
   * Genera contenido usando Gemini con un prompt del sistema
   */
  async generateContent(
    systemPrompt: SystemPrompt,
    userMessage: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<GeminiResponse> {
    const temperature = options?.temperature ?? systemPrompt.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? systemPrompt.maxTokens ?? 2000;

    // Combinar el prompt del sistema con el mensaje del usuario
    const fullPrompt = `${systemPrompt.content}\n\nUsuario: ${userMessage}\n\nAsistente:`;

    try {
      const response = await fetch(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: fullPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
              topP: 0.95,
              topK: 40,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        // Log del error completo para debugging
        console.error("Gemini API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        
        // Mensajes de error más descriptivos
        let errorMessage = `Error ${response.status}`;
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === "string" 
            ? errorData.error 
            : JSON.stringify(errorData.error);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(`API error: ${errorMessage}`);
      }

      const data = await response.json();

      // Extraer el texto de la respuesta
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No se pudo generar una respuesta.";

      // Extraer información de uso si está disponible
      const usage = data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount || 0,
            candidatesTokens: data.usageMetadata.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata.totalTokenCount || 0,
          }
        : undefined;

      return {
        text,
        usage,
      };
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      
      // Si es un error de red o conexión
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Error de conexión con Gemini API. Verifica tu conexión a internet.");
      }
      
      // Si ya es un Error con mensaje, re-lanzarlo
      if (error instanceof Error) {
        throw error;
      }
      
      // Error desconocido
      throw new Error("Error desconocido al comunicarse con Gemini API");
    }
  }

  /**
   * Genera contenido con múltiples mensajes (conversación)
   */
  async generateContentWithHistory(
    systemPrompt: SystemPrompt,
    messages: Array<{ role: "user" | "model"; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<GeminiResponse> {
    const temperature = options?.temperature ?? systemPrompt.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? systemPrompt.maxTokens ?? 2000;

    // Construir el historial de conversación
    // Gemini requiere que el primer mensaje sea del usuario y puede incluir el prompt del sistema
    const contents = messages.map((msg, index) => {
      // Si es el primer mensaje del usuario, combinar con el prompt del sistema
      if (index === 0 && msg.role === "user") {
        return {
          parts: [{ text: `${systemPrompt.content}\n\n${msg.content}` }],
          role: "user" as const,
        };
      }
      return {
        parts: [{ text: msg.content }],
        role: msg.role as "user" | "model",
      };
    });
    
    // Si no hay mensajes o el primero no es del usuario, agregar el prompt del sistema
    if (contents.length === 0 || contents[0].role !== "user") {
      contents.unshift({
        parts: [{ text: systemPrompt.content }],
        role: "user" as const,
      });
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
              topP: 0.95,
              topK: 40,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        // Log del error completo para debugging
        console.error("Gemini API Error (with history):", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        
        // Mensajes de error más descriptivos
        let errorMessage = `Error ${response.status}`;
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === "string" 
            ? errorData.error 
            : JSON.stringify(errorData.error);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(`API error: ${errorMessage}`);
      }

      const data = await response.json();

      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No se pudo generar una respuesta.";

      const usage = data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount || 0,
            candidatesTokens: data.usageMetadata.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata.totalTokenCount || 0,
          }
        : undefined;

      return {
        text,
        usage,
      };
    } catch (error) {
      console.error("Error calling Gemini API (with history):", error);
      
      // Si es un error de red o conexión
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Error de conexión con Gemini API. Verifica tu conexión a internet.");
      }
      
      // Si ya es un Error con mensaje, re-lanzarlo
      if (error instanceof Error) {
        throw error;
      }
      
      // Error desconocido
      throw new Error("Error desconocido al comunicarse con Gemini API");
    }
  }
}

/**
 * Crea una instancia del servicio Gemini con configuración desde variables de entorno
 */
export function createGeminiService(): GeminiService {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY no está configurada en las variables de entorno"
    );
  }

  return new GeminiService({
    apiKey,
    model,
  });
}


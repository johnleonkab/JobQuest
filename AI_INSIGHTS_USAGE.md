# 🤖 Guía de Uso: AI Insights con Gemini

Esta guía explica cómo usar el sistema de AI Insights integrado con Google Gemini.

## 📋 Configuración Inicial

### 1. Variables de Entorno

Añade las siguientes variables a tu archivo `.env.local`:

```env
# Gemini AI Configuration
GEMINI_API_KEY=tu-clave-de-gemini-aqui
GEMINI_MODEL=gemini-1.5-flash  # Opcional: gemini-1.5-pro para análisis más complejos
```

**Cómo obtener la API Key:**
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la clave generada

### 2. Modelos Disponibles

- **`gemini-1.5-flash`** (por defecto): Más rápido y económico, ideal para la mayoría de casos
- **`gemini-1.5-pro`**: Más potente, mejor calidad para análisis complejos
- **`gemini-pro`**: Versión anterior (no recomendado)

## 🏗️ Arquitectura

El sistema está diseñado con **separación de responsabilidades**:

```
src/
├── config/ai/
│   └── prompts.ts          # Prompts del sistema (desacoplados)
├── lib/ai/
│   └── gemini.ts          # Servicio de Gemini (desacoplado)
├── hooks/
│   └── useAIInsights.ts   # Hook para usar desde componentes
└── app/api/ai/
    └── insights/
        └── route.ts       # API route para generar insights
```

### Separación de Prompts y Servicio

Los **prompts del sistema** están completamente desacoplados del servicio de Gemini. Esto permite:
- ✅ Modificar prompts sin tocar el servicio
- ✅ Reutilizar el servicio con diferentes prompts
- ✅ Fácil mantenimiento y testing
- ✅ Cambiar de proveedor de AI sin modificar prompts

## 🎯 Prompts Disponibles

### 1. Análisis de CV (`cv_analysis`)
Analiza un CV completo y proporciona sugerencias de mejora.

```typescript
import { useAIInsights } from "@/hooks/useAIInsights";

const { generateInsights } = useAIInsights();

const response = await generateInsights({
  promptId: "cv_analysis",
  userMessage: "Analiza mi CV y dame sugerencias de mejora",
  cvData: myCVData, // Opcional
});
```

### 2. Optimización de Sección (`section_optimization`)
Optimiza una sección específica del CV.

```typescript
const response = await generateInsights({
  promptId: "section_optimization",
  userMessage: "Optimiza mi sección de experiencia laboral",
  cvData: { experience: myExperiences },
});
```

### 3. Análisis de Brecha de Habilidades (`skills_gap_analysis`)
Analiza las habilidades del usuario y sugiere áreas de desarrollo.

```typescript
const response = await generateInsights({
  promptId: "skills_gap_analysis",
  userMessage: "¿Qué habilidades necesito desarrollar para ser desarrollador senior?",
  cvData: myCVData,
});
```

### 4. Descripción de Experiencia (`experience_description`)
Ayuda a escribir descripciones impactantes de experiencia laboral.

```typescript
const response = await generateInsights({
  promptId: "experience_description",
  userMessage: "Ayúdame a mejorar esta descripción: [tu descripción]",
});
```

### 5. Completitud de Perfil (`profile_completeness`)
Analiza qué falta en el perfil del usuario.

```typescript
const response = await generateInsights({
  promptId: "profile_completeness",
  userMessage: "¿Qué información falta en mi perfil?",
  cvData: myCVData,
});
```

## 💻 Uso en Componentes React

### Ejemplo Básico

```tsx
"use client";

import { useState } from "react";
import { useAIInsights } from "@/hooks/useAIInsights";
import type { CVData } from "@/types/cv";

export default function CVAnalysisComponent() {
  const { generateInsights, loading, error } = useAIInsights();
  const [insights, setInsights] = useState<string>("");
  const [cvData, setCvData] = useState<CVData | null>(null);

  const handleAnalyze = async () => {
    try {
      const response = await generateInsights({
        promptId: "cv_analysis",
        userMessage: "Analiza mi CV y dame sugerencias de mejora",
        cvData: cvData || undefined,
      });
      setInsights(response.text);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analizando..." : "Analizar CV"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {insights && (
        <div className="mt-4">
          <h3>Insights:</h3>
          <pre className="whitespace-pre-wrap">{insights}</pre>
        </div>
      )}
    </div>
  );
}
```

### Ejemplo con Formulario

```tsx
"use client";

import { useState } from "react";
import { useAIInsights } from "@/hooks/useAIInsights";
import { useToast } from "@/contexts/ToastContext";

export default function AIInsightsForm() {
  const { generateInsights, loading } = useAIInsights();
  const { showToast } = useToast();
  const [promptId, setPromptId] = useState("cv_analysis");
  const [userMessage, setUserMessage] = useState("");
  const [result, setResult] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await generateInsights({
        promptId,
        userMessage,
      });
      setResult(response.text);
      showToast({
        type: "success",
        message: "Insights generados correctamente",
      });
    } catch (error) {
      showToast({
        type: "error",
        message: "Error al generar insights",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        value={promptId}
        onChange={(e) => setPromptId(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="cv_analysis">Análisis de CV</option>
        <option value="section_optimization">Optimización de Sección</option>
        <option value="skills_gap_analysis">Análisis de Brecha de Habilidades</option>
        <option value="experience_description">Descripción de Experiencia</option>
        <option value="profile_completeness">Completitud de Perfil</option>
      </select>
      
      <textarea
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="Escribe tu pregunta o solicitud..."
        className="w-full p-2 border rounded"
        rows={4}
      />
      
      <button
        type="submit"
        disabled={loading || !userMessage}
        className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
      >
        {loading ? "Generando..." : "Generar Insights"}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">Resultado:</h3>
          <div className="whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </form>
  );
}
```

## 🔧 Personalización de Prompts

Puedes agregar nuevos prompts en `src/config/ai/prompts.ts`:

```typescript
export const MY_CUSTOM_PROMPT: SystemPrompt = {
  id: 'my_custom_prompt',
  name: 'Mi Prompt Personalizado',
  description: 'Descripción del prompt',
  content: `Eres un experto en...
  
  Tu tarea es...
  
  Formato de respuesta:
  1. ...
  2. ...
  `,
  temperature: 0.7,
  maxTokens: 2000,
};
```

Luego úsalo en tu componente:

```typescript
const response = await generateInsights({
  promptId: "my_custom_prompt",
  userMessage: "Tu mensaje aquí",
});
```

## 🔒 Seguridad

- ✅ La API Key de Gemini **nunca** se expone al frontend
- ✅ Todas las llamadas pasan por el servidor (API route)
- ✅ Se verifica autenticación del usuario antes de generar insights
- ✅ Los prompts del sistema están validados

## 📊 Información de Uso

La respuesta incluye información de uso de tokens:

```typescript
{
  text: "Respuesta generada...",
  usage: {
    promptTokens: 150,
    candidatesTokens: 200,
    totalTokens: 350,
  },
  promptId: "cv_analysis",
  promptName: "Análisis de CV",
}
```

## 🐛 Manejo de Errores

El hook maneja errores automáticamente:

```typescript
const { generateInsights, loading, error } = useAIInsights();

// error será null si no hay errores
// error contendrá el mensaje de error si algo falla
```

Errores comunes:
- **"GEMINI_API_KEY no está configurada"**: Añade la variable de entorno
- **"Error al comunicarse con Gemini API"**: Verifica tu API key y conexión
- **"No autorizado"**: El usuario no está autenticado

## 🚀 Próximos Pasos

1. Integrar AI Insights en la página de CV Builder
2. Crear componentes específicos para cada tipo de insight
3. Añadir más prompts según necesidades
4. Implementar caché de respuestas para optimizar costos
5. Añadir historial de insights generados

## 📚 Recursos

- [Documentación de Gemini API](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Precios de Gemini](https://ai.google.dev/pricing)


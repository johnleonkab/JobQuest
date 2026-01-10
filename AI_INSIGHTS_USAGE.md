# 🤖 Usage Guide: AI Insights with Gemini

This guide explains how to use the AI Insights system integrated with Google Gemini.

## 📋 Initial Configuration

### 1. Environment Variables

Add the following variables to your `.env.local` file:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-key-here
GEMINI_MODEL=gemini-1.5-flash  # Optional: gemini-1.5-pro for more complex analysis
```

**How to obtain the API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click on "Create API Key"
4. Copy the generated key

### 2. Available Models

- **`gemini-1.5-flash`** (default): Faster and cheaper, ideal for most cases
- **`gemini-1.5-pro`**: More powerful, better quality for complex analysis
- **`gemini-pro`**: Previous version (not recommended)

## 🏗️ Architecture

The system is designed with **separation of concerns**:

```
src/
├── config/ai/
│   └── prompts.ts          # System prompts (decoupled)
├── lib/ai/
│   └── gemini.ts          # Gemini service (decoupled)
├── hooks/
│   └── useAIInsights.ts   # Hook for using from components
└── app/api/ai/
    └── insights/
        └── route.ts       # API route for generating insights
```

### Separation of Prompts and Service

The **system prompts** are completely decoupled from the Gemini service. This allows:
- ✅ Modifying prompts without touching the service
- ✅ Reusing the service with different prompts
- ✅ Easy maintenance and testing
- ✅ Changing AI providers without modifying prompts

## 🎯 Available Prompts

### 1. CV Analysis (`cv_analysis`)
Analyzes a full CV and provides improvement suggestions.

```typescript
import { useAIInsights } from "@/hooks/useAIInsights";

const { generateInsights } = useAIInsights();

const response = await generateInsights({
  promptId: "cv_analysis",
  userMessage: "Analyze my CV and give me improvement suggestions",
  cvData: myCVData, // Optional
});
```

### 2. Section Optimization (`section_optimization`)
Optimizes a specific section of the CV.

```typescript
const response = await generateInsights({
  promptId: "section_optimization",
  userMessage: "Optimize my work experience section",
  cvData: { experience: myExperiences },
});
```

### 3. Skills Gap Analysis (`skills_gap_analysis`)
Analyzes user skills and suggests development areas.

```typescript
const response = await generateInsights({
  promptId: "skills_gap_analysis",
  userMessage: "What skills do I need to develop to become a senior developer?",
  cvData: myCVData,
});
```

### 4. Experience Description (`experience_description`)
Helps write impactful work experience descriptions.

```typescript
const response = await generateInsights({
  promptId: "experience_description",
  userMessage: "Help me improve this description: [your description]",
});
```

### 5. Profile Completeness (`profile_completeness`)
Analyzes what is missing in the user profile.

```typescript
const response = await generateInsights({
  promptId: "profile_completeness",
  userMessage: "What information is missing from my profile?",
  cvData: myCVData,
});
```

## 💻 Usage in React Components

### Basic Example

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
        userMessage: "Analyze my CV and give me improvement suggestions",
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
        {loading ? "Analyzing..." : "Analyze CV"}
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

### Example with Form

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
        message: "Insights generated successfully",
      });
    } catch (error) {
      showToast({
        type: "error",
        message: "Error generating insights",
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
        <option value="cv_analysis">CV Analysis</option>
        <option value="section_optimization">Section Optimization</option>
        <option value="skills_gap_analysis">Skills Gap Analysis</option>
        <option value="experience_description">Experience Description</option>
        <option value="profile_completeness">Profile Completeness</option>
      </select>
      
      <textarea
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="Type your question or request..."
        className="w-full p-2 border rounded"
        rows={4}
      />
      
      <button
        type="submit"
        disabled={loading || !userMessage}
        className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Insights"}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">Result:</h3>
          <div className="whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </form>
  );
}
```

## 🔧 Prompt Customization

You can add new prompts in `src/config/ai/prompts.ts`:

```typescript
export const MY_CUSTOM_PROMPT: SystemPrompt = {
  id: 'my_custom_prompt',
  name: 'My Custom Prompt',
  description: 'Prompt description',
  content: `You are an expert in...
  
  Your task is...
  
  Response format:
  1. ...
  2. ...
  `,
  temperature: 0.7,
  maxTokens: 2000,
};
```

Then use it in your component:

```typescript
const response = await generateInsights({
  promptId: "my_custom_prompt",
  userMessage: "Your message here",
});
```

## 🔒 Security

- ✅ Gemini API Key is **never** exposed to the frontend
- ✅ All calls pass through the server (API route)
- ✅ User authentication is verified before generating insights
- ✅ System prompts are validated

## 📊 Usage Information

The response includes token usage information:

```typescript
{
  text: "Generated response...",
  usage: {
    promptTokens: 150,
    candidatesTokens: 200,
    totalTokens: 350,
  },
  promptId: "cv_analysis",
  promptName: "CV Analysis",
}
```

## 🐛 Error Handling

The hook handles errors automatically:

```typescript
const { generateInsights, loading, error } = useAIInsights();

// error will be null if there are no errors
// error will contain the error message if something fails
```

Common errors:
- **"GEMINI_API_KEY is not configured"**: Add the environment variable
- **"Error communicating with Gemini API"**: Check your API key and connection
- **"Unauthorized"**: User is not authenticated

## 🚀 Next Steps

1. Integrate AI Insights into the CV Builder page
2. Create specific components for each insight type
3. Add more prompts as needed
4. Implement response caching to optimize costs
5. Add history of generated insights

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini Pricing](https://ai.google.dev/pricing)

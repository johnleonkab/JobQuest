"use client";

import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { useAIInsights } from "@/hooks/useAIInsights";
import { useToast } from "@/contexts/ToastContext";
import { useGamification } from "@/hooks/useGamification";
import { useTranslations } from "next-intl";
import type { CVData } from "@/types/cv";

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  profileData?: {
    first_name?: string;
    last_name?: string;
    gender?: string;
    headline?: string;
  };
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIInsightsModal({
  isOpen,
  onClose,
  cvData,
  profileData,
}: AIInsightsModalProps) {
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isUsingSavedAnalysis, setIsUsingSavedAnalysis] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const { generateInsights } = useAIInsights();
  const { showToast } = useToast();
  const { recordEvent } = useGamification();
  const t = useTranslations('CVBuilder.aiInsights');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Resetear estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setReport("");
      setChatMessages([]);
      setChatInput("");
      setIsUsingSavedAnalysis(false);
    }
  }, [isOpen]);

  // Verificar si hay un análisis guardado cuando se abre el modal o cambia el CV
  useEffect(() => {
    if (isOpen && !report && !loading) {
      checkForSavedAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Scroll al final de los mensajes del chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const checkForSavedAnalysis = async () => {
    setLoading(true);
    try {
      // Verificar si hay un análisis guardado
      const cvDataJson = encodeURIComponent(JSON.stringify(cvData));
      const response = await fetch(`/api/ai/insights/get?cvData=${cvDataJson}`);

      if (!response.ok) {
        // Si hay error, generar nuevo análisis
        await generateInitialReport();
        return;
      }

      const data = await response.json();

      if (data.hasAnalysis && !data.needsRegeneration) {
        // Hay un análisis guardado y el CV no ha cambiado, usar el guardado
        setReport(data.analysis.text);
        setIsUsingSavedAnalysis(true);
        setChatMessages([]);
        setLoading(false);
      } else {
        // No hay análisis o el CV ha cambiado, generar uno nuevo
        setIsUsingSavedAnalysis(false);
        await generateInitialReport();
      }
    } catch (error) {
      console.error("Error checking saved analysis:", error);
      // Si hay error al verificar, generar nuevo análisis
      await generateInitialReport();
    }
  };

  const generateInitialReport = async () => {
    try {
      // Construir el mensaje con todos los datos del CV y perfil
      const userMessage = buildFullProfileMessage(cvData, profileData);

      const response = await generateInsights({
        promptId: "cv_analysis",
        userMessage,
        cvData,
      });

      setReport(response.text);

      // Guardar el análisis en la base de datos
      await saveAnalysis(response.text);

      // Record gamification event (only for new analysis, not saved ones)
      await recordEvent("ai.insights_generated");

      // No agregar el reporte inicial a los mensajes del chat
      // Solo se mostrará en la sección de "Reporte Inicial"
      setChatMessages([]);
    } catch (error) {
      console.error("Error generating report:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : t('errorGen');

      showToast({
        type: "error",
        message: errorMessage,
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async (analysisText: string) => {
    try {
      await fetch("/api/ai/insights/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvData,
          analysisText,
        }),
      });
    } catch (error) {
      console.error("Error saving analysis:", error);
      // No mostrar error al usuario, es opcional
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");

    // Agregar mensaje del usuario
    const newMessages: Message[] = [
      ...chatMessages,
      { role: "user", content: userMessage },
    ];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      // Usar el prompt de chat y enviar el historial de conversación
      const response = await generateInsights({
        promptId: "cv_chat",
        userMessage: userMessage, // Solo el mensaje del usuario, sin contexto adicional
        cvData, // El contexto del CV se incluirá en el sistema prompt
        chatHistory: newMessages.slice(0, -1), // Enviar historial sin el mensaje actual
      });

      // Agregar respuesta del asistente
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: response.text },
      ]);
    } catch (error) {
      showToast({
        type: "error",
        message: t('errorChat'),
      });
      // Remover el mensaje del usuario si falla
      setChatMessages(chatMessages);
    } finally {
      setChatLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500/75 dark:bg-black/80 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative inline-block align-bottom bg-white dark:bg-[#2d1a22] rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 flex justify-between items-center border-b border-purple-100 dark:border-purple-900/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-200 dark:shadow-none">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">
                  {t('title')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('poweredBy')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/50 dark:bg-white/10 rounded-full p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-white/20 focus:outline-none transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div
            className="px-6 py-6 overflow-y-auto flex-1 bg-[#fcf8f9] dark:bg-[#1a0c10]"
            ref={chatContainerRef}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="size-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-4 animate-pulse">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('analyzing')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {t('analyzingDesc')}
                </p>
              </div>
            ) : !report && !loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-4">
                  <span className="material-symbols-outlined">error</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                  {t('error')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 text-center max-w-md">
                  {t('errorDesc')}
                </p>
                <button
                  onClick={generateInitialReport}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  {t('retry')}
                </button>
              </div>
            ) : (
              <>
                {/* Reporte Inicial */}
                {report && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600 text-[20px]">
                          analytics
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          {t('initialReport')}
                        </h4>
                      </div>
                      {isUsingSavedAnalysis && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">history</span>
                          {t('savedAnalysis')}
                        </span>
                      )}
                    </div>
                    <div className="bg-white dark:bg-[#2d1a22] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                      <div
                        className="max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: formatMarkdown(report),
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Chat */}
                {report && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-purple-600 text-[20px]">
                        forum
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        {t('chatTitle')}
                      </h4>
                    </div>

                    {/* Mensajes del chat */}
                    <div className="space-y-4">
                      {chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user"
                            ? "justify-end"
                            : "justify-start gap-3"
                            }`}
                        >
                          {message.role === "assistant" && (
                            <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                              AI
                            </div>
                          )}
                          <div
                            className={`max-w-[85%] rounded-2xl py-3 px-4 text-sm shadow-sm ${message.role === "user"
                              ? "bg-primary text-white rounded-tr-sm"
                              : "bg-white dark:bg-[#2d1a22] border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-tl-sm"
                              }`}
                          >
                            {message.role === "assistant" ? (
                              <div
                                className="max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: formatMarkdown(message.content),
                                }}
                              />
                            ) : (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start gap-3">
                          <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            AI
                          </div>
                          <div className="bg-white dark:bg-[#2d1a22] border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm py-3 px-4">
                            <div className="flex gap-1">
                              <div className="size-2 bg-gray-400 rounded-full animate-bounce" />
                              <div
                                className="size-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                              <div
                                className="size-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.4s" }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer - Input de chat */}
          {report && (
            <div className="bg-white dark:bg-[#2d1a22] px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t('chatPlaceholder')}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-[#1a0c10] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm text-gray-700 dark:text-white placeholder-gray-400"
                    disabled={chatLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="bg-primary hover:bg-pink-600 text-white p-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-0.5 transition-transform">
                    send
                  </span>
                </button>
              </form>
              <p className="text-[10px] text-center text-gray-400 mt-2">
                {t('disclaimer')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Construye un mensaje completo con todos los datos del perfil
 */
function buildFullProfileMessage(
  cvData: CVData,
  profileData?: {
    first_name?: string;
    last_name?: string;
    gender?: string;
    headline?: string;
  }
): string {
  const parts: string[] = [];

  // Información del perfil
  if (profileData) {
    parts.push("## Información del Perfil:");
    if (profileData.first_name || profileData.last_name) {
      parts.push(
        `Nombre: ${profileData.first_name || ""} ${profileData.last_name || ""}`.trim()
      );
    }
    if (profileData.headline) {
      parts.push(`Headline: ${profileData.headline}`);
    }
    if (profileData.gender) {
      parts.push(`Género: ${profileData.gender}`);
    }
    parts.push("");
  }

  // Experiencia
  if (cvData.experience && cvData.experience.length > 0) {
    parts.push("## Experiencia Laboral:");
    cvData.experience.forEach((exp) => {
      parts.push(
        `- ${exp.position} en ${exp.company_name} (${exp.start_date} - ${exp.end_date || "Presente"})`
      );
      if (exp.description) {
        parts.push(`  Descripción: ${exp.description}`);
      }
      if (exp.skills && exp.skills.length > 0) {
        parts.push(`  Habilidades: ${exp.skills.join(", ")}`);
      }
    });
    parts.push("");
  }

  // Educación
  if (cvData.education && cvData.education.length > 0) {
    parts.push("## Educación:");
    cvData.education.forEach((edu) => {
      parts.push(
        `- ${edu.title} en ${edu.institution} (${edu.start_date} - ${edu.end_date || "Presente"})`
      );
      if (edu.notes) {
        parts.push(`  Notas: ${edu.notes}`);
      }
      if (edu.skills && edu.skills.length > 0) {
        parts.push(`  Habilidades: ${edu.skills.join(", ")}`);
      }
    });
    parts.push("");
  }

  // Certificaciones
  if (cvData.certifications && cvData.certifications.length > 0) {
    parts.push("## Certificaciones:");
    cvData.certifications.forEach((cert) => {
      parts.push(`- ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ""}`);
      if (cert.description) {
        parts.push(`  Descripción: ${cert.description}`);
      }
      if (cert.skills && cert.skills.length > 0) {
        parts.push(`  Habilidades: ${cert.skills.join(", ")}`);
      }
    });
    parts.push("");
  }

  // Idiomas
  if (cvData.languages && cvData.languages.length > 0) {
    parts.push("## Idiomas:");
    cvData.languages.forEach((lang) => {
      parts.push(`- ${lang.language}: ${lang.level}`);
    });
    parts.push("");
  }

  // Proyectos
  if (cvData.projects && cvData.projects.length > 0) {
    parts.push("## Proyectos:");
    cvData.projects.forEach((proj) => {
      parts.push(`- ${proj.name}`);
      if (proj.description) {
        parts.push(`  ${proj.description}`);
      }
      if (proj.start_date) {
        parts.push(`  Fecha: ${proj.start_date} - ${proj.end_date || "Presente"}`);
      }
    });
    parts.push("");
  }

  // Voluntariado
  if (cvData.volunteering && cvData.volunteering.length > 0) {
    parts.push("## Voluntariado:");
    cvData.volunteering.forEach((vol) => {
      parts.push(`- ${vol.title} en ${vol.organization} (${vol.start_date} - ${vol.end_date || "Presente"})`);
      if (vol.description) {
        parts.push(`  ${vol.description}`);
      }
    });
  }

  return parts.join("\n");
}

/**
 * Formatea markdown básico a HTML con mejor manejo de párrafos
 */
function formatMarkdown(text: string): string {
  // Dividir en líneas para procesar
  const lines = text.split('\n');
  const result: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paraText = currentParagraph.join(' ').trim();
      if (paraText) {
        // Aplicar formato de negrita y cursiva dentro del párrafo
        let formatted = paraText
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>");
        result.push(`<p class='mb-3 text-gray-700 dark:text-gray-300 leading-relaxed'>${formatted}</p>`);
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      const listHtml = listItems
        .map(item => {
          // Aplicar formato dentro de los items
          const formatted = item
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.+?)\*/g, "<em>$1</em>");
          return `<li class='mb-2 text-gray-700 dark:text-gray-300'>${formatted}</li>`;
        })
        .join('');
      result.push(`<ul class='list-disc ml-6 mb-4 space-y-1'>${listHtml}</ul>`);
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Títulos
    if (line.startsWith('## ')) {
      flushList();
      flushParagraph();
      const title = line.substring(3).trim();
      result.push(`<h2 class='text-lg font-bold mb-3 mt-6 text-gray-900 dark:text-white'>${title}</h2>`);
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      flushParagraph();
      const title = line.substring(4).trim();
      result.push(`<h3 class='text-base font-semibold mb-2 mt-4 text-gray-900 dark:text-white'>${title}</h3>`);
      continue;
    }

    // Listas con - o •
    if (/^[-•]\s/.test(line)) {
      flushParagraph();
      if (!inList) {
        inList = true;
      }
      const item = line.substring(2).trim();
      listItems.push(item);
      continue;
    }

    // Listas numeradas
    if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      if (!inList) {
        inList = true;
      }
      const item = line.replace(/^\d+\.\s/, '').trim();
      listItems.push(item);
      continue;
    }

    // Línea vacía
    if (!line) {
      flushList();
      flushParagraph();
      continue;
    }

    // Párrafo normal
    if (inList) {
      flushList();
    }
    currentParagraph.push(line);
  }

  // Flush final
  flushList();
  flushParagraph();

  // Sanitizar el HTML antes de retornarlo para prevenir XSS
  const htmlContent = result.join('\n');
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'h2', 'h3', 'ul', 'li', 'ol'],
    ALLOWED_ATTR: ['class'],
  });
}


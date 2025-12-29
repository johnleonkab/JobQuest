"use client";

import { useState, useEffect } from "react";
import type { CVData, CVExperience, CVEducation, CVCertification, CVLanguage, CVVolunteering, CVProject } from "@/types/cv";
import type { JobOffer, SelectedCVSections } from "@/types/job-offers";
import { useToast } from "@/contexts/ToastContext";
import { useAIInsights } from "@/hooks/useAIInsights";
import { useGamification } from "@/hooks/useGamification";

interface CVSectionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sections: SelectedCVSections) => Promise<void>;
  offer: JobOffer;
  cvData: CVData;
}

export default function CVSectionSelectorModal({
  isOpen,
  onClose,
  onSave,
  offer,
  cvData,
}: CVSectionSelectorModalProps) {
  const { showToast } = useToast();
  const { generateInsights, loading: aiLoading } = useAIInsights();
  const { recordEvent } = useGamification();
  const [loading, setLoading] = useState(false);
  const [selectedSections, setSelectedSections] = useState<SelectedCVSections>(
    offer.selected_cv_sections || {}
  );
  const [aiReasoning, setAIReasoning] = useState<string | null>(null);
  const [usedAISuggestion, setUsedAISuggestion] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedSections(offer.selected_cv_sections || {});
      setAIReasoning(null);
    }
  }, [isOpen, offer]);

  const handleAISuggest = async () => {
    try {
      const userMessage = `Analiza esta oferta de trabajo y mi CV completo, y sugiere qué secciones específicas debo incluir:

**Oferta de Trabajo:**
- Empresa: ${offer.company_name}
- Puesto: ${offer.position}
- Descripción: ${offer.job_description || "No disponible"}
- Tipo: ${offer.job_type || "No especificado"}
- Tags: ${offer.tags.join(", ") || "Ninguno"}

**Mi CV Completo:**
${buildCVSummary(cvData)}

Por favor, sugiere qué experiencias, educación, certificaciones, proyectos, etc. son más relevantes para esta oferta específica.`;

      const response = await generateInsights({
        promptId: "cv_section_selection",
        userMessage,
        cvData,
      });

      try {
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          if (result.recommendedSections) {
            setSelectedSections(result.recommendedSections);
            setAIReasoning(result.reasoning || null);
            setUsedAISuggestion(true);
            
            // Record gamification event
            await recordEvent("ai.cv_sections_suggested");
            
            showToast({
              type: "success",
              message: "Secciones sugeridas por IA",
            });
          }
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        showToast({
          type: "error",
          message: "Error al procesar la sugerencia de IA",
        });
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      showToast({
        type: "error",
        message: "Error al obtener sugerencias de IA",
      });
    }
  };

  const buildCVSummary = (cv: CVData): string => {
    const parts: string[] = [];

    if (cv.experience && cv.experience.length > 0) {
      parts.push("\n**Experiencia Laboral:**");
      cv.experience.forEach((exp) => {
        parts.push(`- ID: ${exp.id} | ${exp.position} en ${exp.company_name} (${exp.start_date} - ${exp.end_date || "Presente"})`);
        if (exp.description) parts.push(`  Descripción: ${exp.description.substring(0, 100)}...`);
        if (exp.skills && exp.skills.length > 0) parts.push(`  Habilidades: ${exp.skills.join(", ")}`);
      });
    }

    if (cv.education && cv.education.length > 0) {
      parts.push("\n**Educación:**");
      cv.education.forEach((edu) => {
        parts.push(`- ID: ${edu.id} | ${edu.title} en ${edu.institution} (${edu.start_date} - ${edu.end_date || "Presente"})`);
        if (edu.skills && edu.skills.length > 0) parts.push(`  Habilidades: ${edu.skills.join(", ")}`);
      });
    }

    if (cv.certifications && cv.certifications.length > 0) {
      parts.push("\n**Certificaciones:**");
      cv.certifications.forEach((cert) => {
        parts.push(`- ID: ${cert.id} | ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ""}`);
        if (cert.skills && cert.skills.length > 0) parts.push(`  Habilidades: ${cert.skills.join(", ")}`);
      });
    }

    if (cv.languages && cv.languages.length > 0) {
      parts.push("\n**Idiomas:**");
      cv.languages.forEach((lang) => {
        parts.push(`- ID: ${lang.id} | ${lang.language}: ${lang.level}`);
      });
    }

    if (cv.projects && cv.projects.length > 0) {
      parts.push("\n**Proyectos:**");
      cv.projects.forEach((proj) => {
        parts.push(`- ID: ${proj.id} | ${proj.name}`);
        if (proj.description) parts.push(`  ${proj.description.substring(0, 100)}...`);
      });
    }

    if (cv.volunteering && cv.volunteering.length > 0) {
      parts.push("\n**Voluntariado:**");
      cv.volunteering.forEach((vol) => {
        parts.push(`- ID: ${vol.id} | ${vol.title} en ${vol.organization} (${vol.start_date} - ${vol.end_date || "Presente"})`);
      });
    }

    return parts.join("\n");
  };

  const toggleSection = (
    sectionType: keyof SelectedCVSections,
    itemId: string
  ) => {
    setSelectedSections((prev) => {
      const current = prev[sectionType] || [];
      const newSelection = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
      return {
        ...prev,
        [sectionType]: newSelection.length > 0 ? newSelection : undefined,
      };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(selectedSections);
      showToast({
        type: "success",
        message: "Secciones de CV guardadas correctamente",
      });
      onClose();
    } catch (error) {
      console.error("Error saving CV sections:", error);
      showToast({
        type: "error",
        message: "Error al guardar las secciones",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-gray-200">
          <div className="bg-white/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">description</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  Seleccionar Secciones del CV
                </h3>
                <p className="text-xs text-gray-500">
                  Elige qué partes de tu CV mostrar para esta oferta
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="px-6 py-6 sm:px-8 max-h-[70vh] overflow-y-auto">
            {/* AI Suggestion Button */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Sugerencia Automática con IA
                </h4>
                <p className="text-xs text-gray-500">
                  Deja que la IA analice la oferta y sugiera las secciones más relevantes
                </p>
              </div>
              <button
                onClick={handleAISuggest}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {aiLoading ? "hourglass_empty" : "auto_awesome"}
                </span>
                {aiLoading ? "Analizando..." : "Sugerir con IA"}
              </button>
            </div>

            {aiReasoning && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-start gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-600 text-[18px]">
                    lightbulb
                  </span>
                  <h5 className="text-sm font-semibold text-purple-700">Razonamiento de la IA</h5>
                </div>
                <p className="text-xs text-purple-600">{aiReasoning}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Experience */}
              {cvData.experience && cvData.experience.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">work</span>
                    Experiencia Laboral
                  </h4>
                  <div className="space-y-2">
                    {cvData.experience.map((exp) => (
                      <label
                        key={exp.id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary/30 cursor-pointer transition-all group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSections.experience?.includes(exp.id) || false}
                          onChange={() => toggleSection("experience", exp.id)}
                          className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {exp.position}
                          </p>
                          <p className="text-xs text-gray-500">{exp.company_name}</p>
                          {exp.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {cvData.education && cvData.education.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                    Educación
                  </h4>
                  <div className="space-y-2">
                    {cvData.education.map((edu) => (
                      <label
                        key={edu.id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary/30 cursor-pointer transition-all group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSections.education?.includes(edu.id) || false}
                          onChange={() => toggleSection("education", edu.id)}
                          className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {edu.title}
                          </p>
                          <p className="text-xs text-gray-500">{edu.institution}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {cvData.certifications && cvData.certifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    Certificaciones
                  </h4>
                  <div className="space-y-2">
                    {cvData.certifications.map((cert) => (
                      <label
                        key={cert.id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary/30 cursor-pointer transition-all group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSections.certifications?.includes(cert.id) || false}
                          onChange={() => toggleSection("certifications", cert.id)}
                          className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {cert.name}
                          </p>
                          {cert.issuer && (
                            <p className="text-xs text-gray-500">{cert.issuer}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {cvData.languages && cvData.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">language</span>
                    Idiomas
                  </h4>
                  <div className="space-y-2">
                    {cvData.languages.map((lang) => (
                      <label
                        key={lang.id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary/30 cursor-pointer transition-all group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSections.languages?.includes(lang.id) || false}
                          onChange={() => toggleSection("languages", lang.id)}
                          className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {lang.language} - {lang.level}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {cvData.projects && cvData.projects.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">rocket_launch</span>
                    Proyectos
                  </h4>
                  <div className="space-y-2">
                    {cvData.projects.map((proj) => (
                      <label
                        key={proj.id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary/30 cursor-pointer transition-all group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSections.projects?.includes(proj.id) || false}
                          onChange={() => toggleSection("projects", proj.id)}
                          className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {proj.name}
                          </p>
                          {proj.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {proj.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Volunteering */}
              {cvData.volunteering && cvData.volunteering.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">volunteer_activism</span>
                    Voluntariado
                  </h4>
                  <div className="space-y-2">
                    {cvData.volunteering.map((vol) => (
                      <label
                        key={vol.id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary/30 cursor-pointer transition-all group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSections.volunteering?.includes(vol.id) || false}
                          onChange={() => toggleSection("volunteering", vol.id)}
                          className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {vol.title}
                          </p>
                          <p className="text-xs text-gray-500">{vol.organization}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(!cvData.experience || cvData.experience.length === 0) &&
                (!cvData.education || cvData.education.length === 0) &&
                (!cvData.certifications || cvData.certifications.length === 0) &&
                (!cvData.languages || cvData.languages.length === 0) &&
                (!cvData.projects || cvData.projects.length === 0) &&
                (!cvData.volunteering || cvData.volunteering.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2">description</span>
                    <p className="text-sm">No hay secciones de CV disponibles.</p>
                    <p className="text-xs mt-1">Añade contenido a tu CV primero.</p>
                  </div>
                )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-pink-600 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Selección"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


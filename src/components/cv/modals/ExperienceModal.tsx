"use client";

import { useState, useEffect } from "react";
import type { CVExperience } from "@/types/cv";
import { useToast } from "@/contexts/ToastContext";
import { useAISectionImprover } from "@/hooks/useAISectionImprover";
import { useGamification } from "@/hooks/useGamification";

interface ExperienceModalProps {
  experienceId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExperienceModal({
  experienceId,
  onClose,
  onSuccess,
}: ExperienceModalProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { improveSection, loading: aiLoading } = useAISectionImprover();
  const { recordEvent } = useGamification();
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<{
    description: string;
    tags: string[];
  } | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    position: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (experienceId) {
      fetchExperience();
    }
  }, [experienceId]);

  const fetchExperience = async () => {
    try {
      const response = await fetch("/api/cv/experience");
      const experiences: CVExperience[] = await response.json();
      const exp = experiences.find((e) => e.id === experienceId);
      if (exp) {
        setFormData({
          company_name: exp.company_name,
          position: exp.position,
          start_date: exp.start_date,
          end_date: exp.end_date || "",
          is_current: exp.is_current,
          description: exp.description || "",
          skills: exp.skills || [],
        });
      }
    } catch (error) {
      console.error("Error fetching experience:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/cv/experience";
      const method = experienceId ? "PUT" : "POST";
      
      // Preparar el body, asegurando que end_date sea null si is_current es true
      const body = experienceId
        ? { 
            id: experienceId, 
            ...formData,
            end_date: formData.is_current ? null : formData.end_date || null,
          }
        : {
            ...formData,
            end_date: formData.is_current ? null : formData.end_date || null,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to save experience");
      }

      showToast({
        type: "success",
        message: experienceId
          ? "Experiencia actualizada correctamente"
          : "Experiencia agregada correctamente",
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving experience:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al guardar la experiencia";
      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleImproveWithAI = async () => {
    // Validar que haya contenido para mejorar
    if (!formData.description || formData.description.trim().length === 0) {
      showToast({
        type: "error",
        message: "Escribe una descripción primero para poder mejorarla con IA",
      });
      return;
    }

    try {
      const result = await improveSection({
        sectionType: "experiencia_laboral",
        description: formData.description,
        tags: formData.skills,
        context: {
          empresa: formData.company_name,
          puesto: formData.position,
          fecha_inicio: formData.start_date,
          fecha_fin: formData.end_date || "Presente",
        },
      });

      if (result) {
        setAISuggestions({
          description: result.description,
          tags: result.tags,
        });
        setShowAISuggestions(true);
        showToast({
          type: "success",
          message: "Mejoras generadas con IA. Revisa y acepta o rechaza los cambios.",
        });
      } else {
        showToast({
          type: "error",
          message: "No se pudieron generar mejoras. Intenta de nuevo.",
        });
      }
    } catch (error) {
      console.error("Error improving with AI:", error);
      showToast({
        type: "error",
        message: "Error al mejorar con IA. Intenta de nuevo.",
      });
    }
  };

  const handleAcceptAISuggestions = async () => {
    if (aiSuggestions) {
      setFormData({
        ...formData,
        description: aiSuggestions.description,
        skills: aiSuggestions.tags,
      });
      setShowAISuggestions(false);
      setAISuggestions(null);
      
      // Record gamification event
      await recordEvent("ai.section_improved");
      
      showToast({
        type: "success",
        message: "Mejoras aplicadas correctamente",
      });
    }
  };

  const handleRejectAISuggestions = () => {
    setShowAISuggestions(false);
    setAISuggestions(null);
  };

  // El botón está disponible si hay datos básicos rellenos (empresa y puesto)
  // y hay alguna descripción (aunque sea corta, la IA puede mejorarla)
  const canImproveWithAI = 
    (formData.company_name.trim().length > 0 && formData.position.trim().length > 0) &&
    (formData.description && formData.description.trim().length > 0);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-200">
          <div className="bg-white/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">work</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  Experiencia Laboral
                </h3>
                <p className="text-xs text-gray-500">
                  {experienceId ? "Edita" : "Añade"} tu experiencia profesional
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
          <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8">
            <div className="space-y-5">
              <div>
                <label
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                  htmlFor="company"
                >
                  Nombre de la empresa *
                </label>
                <input
                  id="company"
                  required
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                  placeholder="Ej. Tech Solutions Inc."
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                  htmlFor="position"
                >
                  Puesto *
                </label>
                <input
                  id="position"
                  required
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                  placeholder="Ej. Senior Product Designer"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                    htmlFor="start-date"
                  >
                    Fecha de inicio *
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      className="block text-sm font-semibold text-gray-700"
                      htmlFor="end-date"
                    >
                      Fecha de final
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="current-job"
                        type="checkbox"
                        checked={formData.is_current}
                        onChange={(e) =>
                          setFormData({ ...formData, is_current: e.target.checked })
                        }
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <label
                        htmlFor="current-job"
                        className="text-xs text-gray-500 font-medium cursor-pointer"
                      >
                        Ocupación actual
                      </label>
                    </div>
                  </div>
                  <input
                    id="end-date"
                    type="date"
                    disabled={formData.is_current}
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="block text-sm font-semibold text-gray-700"
                    htmlFor="description"
                  >
                    Descripción
                  </label>
                  {canImproveWithAI && (
                    <button
                      type="button"
                      onClick={handleImproveWithAI}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {aiLoading ? "hourglass_empty" : "auto_awesome"}
                      </span>
                      {aiLoading ? "Mejorando..." : "Mejorar con IA"}
                    </button>
                  )}
                </div>
                {showAISuggestions && aiSuggestions && (
                  <div className="mb-3 p-3 rounded-xl bg-purple-50 border border-purple-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600 text-[18px]">
                          auto_awesome
                        </span>
                        <span className="text-xs font-semibold text-purple-700">
                          Sugerencias de IA
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRejectAISuggestions}
                        className="text-purple-400 hover:text-purple-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-purple-700 mb-1">
                          Descripción mejorada:
                        </p>
                        <p className="text-xs text-gray-700 bg-white p-2 rounded border border-purple-100">
                          {aiSuggestions.description}
                        </p>
                      </div>
                      {aiSuggestions.tags.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-purple-700 mb-1">
                            Tags sugeridos:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {aiSuggestions.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-white rounded text-[10px] font-medium text-purple-600 border border-purple-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleAcceptAISuggestions}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                      >
                        Aceptar cambios
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectAISuggestions}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-600 hover:bg-purple-100 transition-colors"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                )}
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all resize-none"
                  placeholder="Describe tus responsabilidades, logros principales y herramientas utilizadas..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Hitos (tags)
                </label>
                <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all flex flex-wrap gap-2 min-h-[50px] items-center">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 pl-2 pr-1.5 py-1 text-xs font-semibold text-primary border border-primary/20"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-primary/20 rounded-md p-0.5 transition-colors text-primary/70 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[14px] font-bold">
                          close
                        </span>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 bg-transparent border-none p-1 focus:ring-0 text-sm placeholder-gray-400 text-gray-900 min-w-[120px]"
                    placeholder="Escribe y presiona Enter..."
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  Añade palabras clave que destaquen tus competencias.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-3xl -mx-6 -mb-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-pink-600 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar Experiencia"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


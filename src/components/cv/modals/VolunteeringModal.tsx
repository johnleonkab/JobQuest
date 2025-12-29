"use client";

import { useState, useEffect } from "react";
import type { CVVolunteering } from "@/types/cv";
import { useToast } from "@/contexts/ToastContext";
import { useAISectionImprover } from "@/hooks/useAISectionImprover";
import { useGamification } from "@/hooks/useGamification";

interface VolunteeringModalProps {
  volunteeringId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VolunteeringModal({
  volunteeringId,
  onClose,
  onSuccess,
}: VolunteeringModalProps) {
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
    organization: "",
    title: "",
    start_date: "",
    end_date: "",
    is_ongoing: false,
    description: "",
  });

  useEffect(() => {
    if (volunteeringId) {
      fetchVolunteering();
    }
  }, [volunteeringId]);

  const fetchVolunteering = async () => {
    try {
      const response = await fetch("/api/cv/volunteering");
      const volunteering: CVVolunteering[] = await response.json();
      const vol = volunteering.find((v) => v.id === volunteeringId);
      if (vol) {
        setFormData({
          organization: vol.organization,
          title: vol.title,
          start_date: vol.start_date,
          end_date: vol.end_date || "",
          is_ongoing: vol.is_ongoing,
          description: vol.description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching volunteering:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = volunteeringId
        ? { id: volunteeringId, ...formData }
        : formData;

      const response = await fetch("/api/cv/volunteering", {
        method: volunteeringId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save volunteering");

      showToast({
        type: "success",
        message: volunteeringId
          ? "Voluntariado actualizado correctamente"
          : "Voluntariado agregado correctamente",
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving volunteering:", error);
      showToast({
        type: "error",
        message: "Error al guardar el voluntariado",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImproveWithAI = async () => {
    if (!formData.description || formData.description.trim().length === 0) {
      showToast({
        type: "error",
        message: "Escribe una descripción primero para poder mejorarla con IA",
      });
      return;
    }

    try {
      const result = await improveSection({
        sectionType: "voluntariado",
        description: formData.description,
        tags: [],
        context: {
          organizacion: formData.organization,
          titulo: formData.title,
          fecha_inicio: formData.start_date,
          fecha_fin: formData.end_date || "En curso",
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

  // El botón está disponible si hay datos básicos rellenos (organización y título) y hay descripción
  const canImproveWithAI = 
    (formData.organization.trim().length > 0 && formData.title.trim().length > 0) &&
    (formData.description && formData.description.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-200">
          <div className="bg-white/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">volunteer_activism</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">Voluntariado</h3>
                <p className="text-xs text-gray-500">
                  {volunteeringId ? "Edita" : "Añade"} tu experiencia de voluntariado
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Entidad u organización *
                </label>
                <input
                  required
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Título *
                </label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Fecha de inicio *
                  </label>
                  <input
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
                    <label className="block text-sm font-semibold text-gray-700">
                      Fecha de final
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_ongoing}
                        onChange={(e) =>
                          setFormData({ ...formData, is_ongoing: e.target.checked })
                        }
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <label className="text-xs text-gray-500 font-medium cursor-pointer">
                        En curso
                      </label>
                    </div>
                  </div>
                  <input
                    type="date"
                    disabled={formData.is_ongoing}
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
                  <label className="block text-sm font-semibold text-gray-700">
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-primary shadow-sm sm:text-sm py-3 px-4 transition-all resize-none"
                  rows={3}
                />
              </div>
            </div>
          </form>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-pink-600 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Voluntariado"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

